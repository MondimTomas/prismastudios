import { spawnSync } from "node:child_process";

const result = spawnSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
  encoding: "utf8",
});

if (result.status !== 0) {
  process.exit(1);
}

const changed = result.stdout
  .split(/\r?\n/)
  .map((line) => line.trim())
  .filter(Boolean);

const ignoredPrefixes = ["browser-extension/", "supabase/"];
const ignoredFiles = new Set(["README.md"]);

const relevant = changed.filter(
  (file) =>
    !ignoredPrefixes.some((prefix) => file.startsWith(prefix)) &&
    !ignoredFiles.has(file),
);

if (relevant.length === 0) {
  console.log("Only non-Vercel files changed; skipping deployment.");
  process.exit(0);
}

console.log("Site-affecting changes detected; continuing deployment.");
process.exit(1);
