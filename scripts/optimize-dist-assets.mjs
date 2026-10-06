import { createHash } from "node:crypto";
import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIST_DIR = path.resolve("dist");
const MIN_BYTES = 180 * 1024;
const MAX_EDGE = 2200;
const WEBP_QUALITY = 82;
const BATCH_SIZE = 4;

const SUPABASE_URL = "https://pukvvgovkksbispokjvx.supabase.co";
const STORAGE_BUCKET = "site-assets";
const STORAGE_PREFIX = "v1";
const UPLOAD_ENDPOINT = `${SUPABASE_URL}/functions/v1/site-asset-upload`;
const PUBLIC_BASE = `${SUPABASE_URL}/storage/v1/object/public/${STORAGE_BUCKET}`;

const TEXT_EXTENSIONS = new Set([".html", ".js", ".css", ".json", ".map"]);
const IMAGE_EXTENSIONS = new Set([".jpg", ".jpeg", ".png"]);

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await walk(fullPath)));
    else files.push(fullPath);
  }

  return files;
}

function toPosixRelative(filePath) {
  return path.relative(DIST_DIR, filePath).split(path.sep).join("/");
}

function formatMb(bytes) {
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function encodeStoragePath(value) {
  return value
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

function replacementVariants(oldRel, publicUrl) {
  const oldRoot = `/${oldRel}`;
  const oldPublic = `/public/${oldRel}`;

  return [
    [oldPublic, publicUrl],
    [encodeURI(oldPublic), publicUrl],
    [oldRoot, publicUrl],
    [encodeURI(oldRoot), publicUrl],
    [oldRel, publicUrl],
    [encodeURI(oldRel), publicUrl],
  ];
}

function storageTarget(oldRel, bytes) {
  const hash = createHash("sha256").update(bytes).digest("hex").slice(0, 16);
  const storagePath = `${STORAGE_PREFIX}/${oldRel}.${hash}.webp`;
  const publicUrl = `${PUBLIC_BASE}/${encodeStoragePath(storagePath)}`;

  return { storagePath, publicUrl };
}

async function ensureRemoteImage(outputPath, oldRel) {
  const bytes = await readFile(outputPath);
  const { storagePath, publicUrl } = storageTarget(oldRel, bytes);

  try {
    const existing = await fetch(publicUrl, { method: "HEAD" });
    if (existing.ok) {
      return { publicUrl, storagePath, uploaded: false };
    }
  } catch {
    // A missing cache/CDN response should not block the upload attempt.
  }

  const token = process.env.PRISMA_ASSET_SYNC_TOKEN;

  if (!token) {
    throw new Error("PRISMA_ASSET_SYNC_TOKEN is missing.");
  }

  const response = await fetch(UPLOAD_ENDPOINT, {
    method: "POST",
    headers: {
      "content-type": "image/webp",
      "x-prisma-token": token,
      "x-asset-path": encodeURIComponent(storagePath),
    },
    body: bytes,
  });

  if (!response.ok) {
    const message = await response.text().catch(() => "");
    throw new Error(
      `Supabase upload failed (${response.status})${message ? `: ${message}` : ""}`,
    );
  }

  return { publicUrl, storagePath, uploaded: true };
}

async function convertAndMirrorImage(filePath) {
  const info = await stat(filePath);
  if (info.size < MIN_BYTES) return null;

  const oldRel = toPosixRelative(filePath);
  const outputPath = `${filePath}.webp`;

  await sharp(filePath)
    .rotate()
    .resize({
      width: MAX_EDGE,
      height: MAX_EDGE,
      fit: "inside",
      withoutEnlargement: true,
    })
    .webp({
      quality: WEBP_QUALITY,
      effort: 4,
      smartSubsample: true,
    })
    .toFile(outputPath);

  const outputInfo = await stat(outputPath);

  if (outputInfo.size >= info.size * 0.95) {
    await unlink(outputPath);
    return null;
  }

  try {
    const remote = await ensureRemoteImage(outputPath, oldRel);

    // Only remove deployment copies after the CDN object is confirmed.
    await unlink(filePath);
    await unlink(outputPath);

    return {
      oldRel,
      publicUrl: remote.publicUrl,
      storagePath: remote.storagePath,
      uploaded: remote.uploaded,
      before: info.size,
      after: outputInfo.size,
    };
  } catch (error) {
    // Keep the original deployment image as a safe fallback.
    await unlink(outputPath).catch(() => {});
    throw error;
  }
}

async function rewriteReferences(files, conversions) {
  if (!conversions.length) return 0;

  let changedFiles = 0;

  for (const filePath of files) {
    if (!TEXT_EXTENSIONS.has(path.extname(filePath).toLowerCase())) continue;

    let content;
    try {
      content = await readFile(filePath, "utf8");
    } catch {
      continue;
    }

    const original = content;

    for (const conversion of conversions) {
      for (const [from, to] of replacementVariants(
        conversion.oldRel,
        conversion.publicUrl,
      )) {
        if (content.includes(from)) content = content.split(from).join(to);
      }
    }

    if (content !== original) {
      await writeFile(filePath, content, "utf8");
      changedFiles += 1;
    }
  }

  return changedFiles;
}

async function main() {
  let files;
  try {
    files = await walk(DIST_DIR);
  } catch {
    console.log("[asset-opt] dist/ not found; skipping optimization.");
    return;
  }

  const candidates = files.filter((filePath) =>
    IMAGE_EXTENSIONS.has(path.extname(filePath).toLowerCase()),
  );

  const conversions = [];
  let failed = 0;

  for (let offset = 0; offset < candidates.length; offset += BATCH_SIZE) {
    const batch = candidates.slice(offset, offset + BATCH_SIZE);

    const results = await Promise.all(
      batch.map(async (filePath) => {
        try {
          return await convertAndMirrorImage(filePath);
        } catch (error) {
          failed += 1;
          console.warn(
            `[asset-opt] kept local fallback for ${toPosixRelative(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
          );
          return null;
        }
      }),
    );

    conversions.push(...results.filter(Boolean));
  }

  const refreshedFiles = await walk(DIST_DIR);
  const rewritten = await rewriteReferences(refreshedFiles, conversions);
  const before = conversions.reduce((sum, item) => sum + item.before, 0);
  const remoteBytes = conversions.reduce((sum, item) => sum + item.after, 0);
  const savedFromDeployment = before;
  const uploaded = conversions.filter((item) => item.uploaded).length;
  const reused = conversions.length - uploaded;

  console.log(
    `[asset-opt] ${conversions.length} images moved off Vercel; ${formatMb(savedFromDeployment)} removed from deployment output; ${formatMb(remoteBytes)} stored as optimized WebP in Supabase. Uploaded ${uploaded}, reused ${reused}, local fallbacks ${failed}. Rewrote ${rewritten} output files.`,
  );
}

main().catch((error) => {
  console.error("[asset-opt] fatal error:", error);
  process.exitCode = 1;
});
