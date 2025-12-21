export type Meta = { region: string, language: string };
export type Language = { meta?: Meta } & Record<string, any>;

export type OBJ = Record<string, any>;