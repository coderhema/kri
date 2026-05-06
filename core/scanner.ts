import fs from "fs/promises";
import path from "path";

const IGNORE = new Set(["node_modules", ".git", "dist", "build"]);

export async function isEmptyDir(dir) {
  const entries = await fs.readdir(dir);
  return entries.length === 0;
}

export async function scanCodebase(dir) {
  const files = [];
  async function walk(current) {
    const entries = await fs.readdir(current, { withFileTypes: true });
    for (const entry of entries) {
      if (IGNORE.has(entry.name)) continue;
      const full = path.join(current, entry.name);
      if (entry.isDirectory()) {
        await walk(full);
      } else {
        files.push(full);
      }
    }
  }
  await walk(dir);
  return files;
}

export async function readFiles(filePaths) {
  const results = [];
  for (const file of filePaths) {
    const content = await fs.readFile(file, "utf8");
    results.push({ file, content });
  }
  return results;
}
