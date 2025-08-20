import { Vector, VectorObject } from "@papit/game-vector";

/**
 * 
 * @param {VectorObject} p1 
 * @param {VectorObject} p2 
 * @param {VectorObject} p3 
 * @param {VectorObject} p4 
 * @returns false|Vector
 */
export function LineIntersection(p1:VectorObject, p2:VectorObject, p3:VectorObject, p4:VectorObject) {
  const D1 = Vector.Subtract(p2, p1);
  const D2 = Vector.Subtract(p4, p3);
  
  const denominator = Vector.Cross(D1, D2).z;
  if (denominator === 0) return false;
  
  const D3 = Vector.Subtract(p3, p1);
  const t = Vector.Cross(D3, D2).z / denominator;
  const u = Vector.Cross(D3, D1).z / denominator;

  return {
    x: p1.x + t * D1.x,
    y: p1.y + t * D1.y,
    t,
    u,
  };
}
/**
 * 
 * @param {VectorObject} p1 
 * @param {VectorObject} p2 
 * @param {VectorObject} p3 
 * @param {VectorObject} p4 
 * @returns false|Vector
 */
export function SegmentIntersection(p1:VectorObject, p2:VectorObject, p3:VectorObject, p4:VectorObject) {

  const i = LineIntersection(p1, p2, p3, p4);
  if (i === false) return false;
  
  if (i.t >= 0 && i.t <= 1 && i.u >= 0 && i.u <= 1)
  {
    return i;
  }

  return false;
}
