export type Vector2Object = {
  x: number;
  y: number;
}
export type RectangleObject = Vector2Object & {
  w: number;
  h: number;
}

export type CircleObject = Vector2Object & {
  r: number;
}

export interface PolygonObject {
  verticies: Vector2Object[];
  triangles: number[];
  boundaryindex: null | number[];
  concave?: boolean;
  id: number;
  centeroffset?: Vector2Object;

  get boundary(): null | RectangleObject;
  get center(): Vector2Object;

  getTriangle(i: number): Vector2Object[];
}
export type SimplePolygonObject = {
  verticies: Vector2Object[];
  triangles: number[];
}

