export type VectorObject = {
  x: number;
  y: number;
  z?: number;
}
export type Vector3Object = VectorObject & {
  z: number;
}
export type PrintSettings = {
  z: boolean;
  round: boolean;
}

export const DEFAULT_PRINT_SETTINGS: PrintSettings = {z: false, round: true};
