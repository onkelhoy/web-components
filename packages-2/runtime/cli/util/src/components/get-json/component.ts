import fs from "node:fs";

/**
 * Load a JSON file from the given filepath.
 *
 * @param {string} filepath - Path to the JSON file.
 * @returns {any|null} Parsed JSON content, or `null` if the file does not exist.
 */
export function getJSON(filepath: string):unknown|null {
  try {
    const content = fs.readFileSync(filepath, "utf-8");
    return JSON.parse(content);
  } catch (err) {
    if (
      err instanceof Error &&
      "code" in err &&
      (err as NodeJS.ErrnoException).code === "ENOENT"
    ) {
      // File does not exist
      console.warn(`File not found: ${filepath}`);
      return null;
    }
    // Other errors (e.g., invalid JSON) should still be thrown
    throw err;
  }
}
