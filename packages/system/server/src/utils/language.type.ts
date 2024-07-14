export type Level = "global" | "package" | "view";
export type Meta = { region: string, language: string };

export type Language = Record<string, { meta: Meta } & Record<string, any>>