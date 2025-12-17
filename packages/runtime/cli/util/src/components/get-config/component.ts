import fs from "node:fs";

/**
 * Load a .config file from the given filepath.
 *
 * @param {string} filepath - Path to the JSON file.
 * @returns {ConfigRecord|null} Parsed config content, or `null` if the file does not exist.
 */

type ConfigRecord = Partial<Record<"NAME" | "CLASS_NAME" | "COMPONENT_TYPE" | "LAYER_FOLDER" | "LAYER_NAME" | "LAYER_INCLUDE" | "IS_LAYER" | (string & {}), string>> & { TEMPLATE_TYPE?: "node"|"web-component"|"game"|(string & {})};
export function getConfig(filepath: string): ConfigRecord | null {
  try {
    const lines = fs.readFileSync(filepath, "utf-8").split("\n");
  
    const record: ConfigRecord = {};
    for (let line of lines) 
    {
      const [name, value] = line.split("=");
      record[name] = value;
    }
    return record;
  }
  catch {
    return null;
  }
}