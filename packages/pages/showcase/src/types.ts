type info = { name: string; displayname?: string; };
export type Layer = info & { packages: (info | string)[]; };
