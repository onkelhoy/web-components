import fs from "node:fs/promises";
import path from "node:path";

/**
 * Recursively copy a folder to a destination.
 * Optionally, post-process files with a parser function.
 *
 * @param {string} src - Source folder path
 * @param {string} dest - Destination folder path
 * @param {(content: string) => string | Promise<string>} [parser] - Optional function to transform file content
 */
export async function copyFolder(src:string, dest: string, parser: (content: string) => string | Promise<string>) {
  // Ensure destination exists
  await fs.mkdir(dest, { recursive: true });

  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyFolder(srcPath, destPath, parser); // recursive copy
    } else if (entry.isFile()) {
      await fs.copyFile(srcPath, destPath);

      if (typeof parser === "function") {
        const content = await fs.readFile(destPath, "utf-8");
        const newContent = await parser(content);
        await fs.writeFile(destPath, newContent, "utf-8");
      }
    }
  }
}
