import { Vector, VectorObject } from "@papit/game-vector";

/**
 * 
 * @param {VectorObject} p 
 * @param {VectorObject[]} triangle 
 */
export function isPointInTriangle(p:VectorObject, ...triangle: VectorObject[]) {
  if (triangle.length !== 3) throw new Error(`${triangle} is not a triangle`);

  if (!pointintriangle_helper(p, triangle, 0)) return false; // a -> p
  if (!pointintriangle_helper(p, triangle, 1)) return false; // b -> p
  if (!pointintriangle_helper(p, triangle, 2)) return false; // c -> p

  return true;
}

function pointintriangle_helper(p:VectorObject, triangle:VectorObject[], index:number) {
  const ab = Vector.Subtract(triangle[(index + 1) % triangle.length], triangle[index]); // b - a 
  const ap = Vector.Subtract(p, triangle[index]); // p - a 

  return Vector.Cross(ab, ap) >= 0;
}