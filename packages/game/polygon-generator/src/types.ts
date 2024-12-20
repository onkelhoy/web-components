export type Point = {
  x:number;
  y:number;
  key:string;
}

export type Pixel = {
  outofbounds: boolean;
  index?: number;
  r: number;
  g: number;
  b: number;
  a: number;
}