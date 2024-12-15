import { Vector, VectorObject } from "@papit/game-vector";
import { Shape } from "@papit/game-shape";


export function GJK(a:Shape, b:Shape) {
  let direction = Vector.Random; // start b

  let simplex:number[] = []; // triangle 
  let oldsimplex:number[] = [];
  const CSO = {}; // configuration space obstacle
  while (gjk_notsamesimplex(simplex, oldsimplex))
  {
    /// TODO implement me 
    // const pa = gjk_getpoint(a, direction);
    // const pb = gjk_getpoint(b, direction.Opposite);

    // const point = pa.Sub(pb);
    
  }
}

function gjk_notsamesimplex(a:number[], b:number[])
{
  if (a.length === 0) return true;
  if (a.length !== b.length) return true;
  for (let i=0; i<a.length; i++)
  {
    if (a[i].toString() !== b[i].toString()) return true;
  }

  return false; // its the same
}

/**
 * Get's the support point to build the CSO
 * @param {Shape} shape 
 * @param {Vector} direction 
 * @returns {Vector} support-point
 */
function gjk_supportppoint(shape:Shape, direction:VectorObject) {
  if (shape.supportFunction) 
  {
    return shape.supportFunction(direction);
  }
}