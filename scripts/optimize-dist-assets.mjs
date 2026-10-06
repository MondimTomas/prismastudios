import { readdir, readFile, stat, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const DIST_DIR = path.resolve("dist");
const MIN_BYTES = 180 * 1024;
const MAX_EDGE = 2200;
const WEBP_QUALITY = 82;
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

function replacementVariants(oldRel, newRel) {
  const oldRoot = `/${oldRel}`;
  const newRoot = `/${newRel}`;
  const oldPublic = `/public/${oldRel}`;
  const newPublic = `/public/${newRel}`;

  return [
    [oldPublic, newPublic],
    [encodeURI(oldPublic), encodeURI(newPublic)],
    [oldRoot, newRoot],
    [encodeURI(oldRoot), encodeURI(newRoot)],
    [oldRel, newRel],
    [encodeURI(oldRel), encodeURI(newRel)],
  ];
}

async function convertImage(filePath) {
  const info = await stat(filePath);
  if (info.size < MIN_BYTES) return null;

  const oldRel = toPosixRelative(filePath);
  const outputPath = `${filePath}.webp`;
  const newRel = `${oldRel}.webp`;

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

  await unlink(filePath);

  return {
    oldRel,
    newRel,
    before: info.size,
    after: outputInfo.size,
  };
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
        conversion.newRel,
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

  for (const filePath of candidates) {
    try {
      const result = await convertImage(filePath);
      if (result) conversions.push(result);
    } catch (error) {
      console.warn(
        `[asset-opt] skipped ${toPosixRelative(filePath)}: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  }

  const refreshedFiles = await walk(DIST_DIR);
  const rewritten = await rewriteReferences(refreshedFiles, conversions);
  const before = conversions.reduce((sum, item) => sum + item.before, 0);
  const after = conversions.reduce((sum, item) => sum + item.after, 0);
  const saved = before - after;
  const pct = before > 0 ? Math.round((saved / before) * 100) : 0;

  console.log(
    `[asset-opt] ${conversions.length} images optimized; ${formatMb(before)} -> ${formatMb(after)} (${pct}% saved). Rewrote ${rewritten} output files.`,
  );
}

main().catch((error) => {
  console.error("[asset-opt] fatal error:", error);
  process.exitCode = 1;
});
