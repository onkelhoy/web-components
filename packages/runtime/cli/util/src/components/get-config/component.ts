import fs from "node:fs";

/**
 * Load a .config file from the given filepath.
 *
 * @param {string} filepath - Path to the JSON file.
 * @returns {ConfigRecord|null} Parsed config content, or `null` if the file does not exist.
 */

type ConfigNames = "NAME" | "CLASS_NAME" | "COMPONENT_TYPE" | "LAYER_FOLDER" | "LAYER_NAME" | "IS_LAYER" | "CAN_PUBLISH" | "FULL_NAME" | "PACKAGE_NAME" | "HTML_PREFIX";
type ConfigRecord =
  Partial<Record<ConfigNames | (string & {}), string>>
  & {
    TEMPLATE_TYPE?: "node" | "web-component" | "game" | (string & {}),
    LAYER_INCLUDE?: "false" | "prefix" | "suffix";
  };
export function getConfig(filepath: string): ConfigRecord | null {
  try
  {
    const lines = fs.readFileSync(filepath, "utf-8").split("\n");

    const record: ConfigRecord = {};
    for (let line of lines) 
    {
      const trimmed = line.trim();
      if (trimmed.startsWith("#")) 
      {
        record[`COMMENT_${trimmed.slice(1).trim()}`]
        continue;
      };

      const [name, value] = trimmed.split("=");
      record[name] = value;
    }
    return record;
  }
  catch
  {
    return null;
  }
}