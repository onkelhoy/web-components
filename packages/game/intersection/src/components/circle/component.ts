import { Vector, VectorObject } from "@papit/game-vector";
import { CircleObject } from "@papit/game-shape";

/**
 * 
 * @param {CircleObject} a 
 * @param {CircleObject} b 
 * @returns boolean|Circle
 */
export function CircleIntersection(a:CircleObject, b:CircleObject) {
  const dv = Vector.Subtract(b, a);
  const d = dv.magnitude;

  if (d <= a.r + b.r) 
  {
    const r = (a.r + b.r - d) / 2;
    const arp = a.r ** 2;

    const aa = (arp - b.r ** 2 + d ** 2) / (2 * d);
    const h = Math.sqrt(arp - aa ** 2);

    const vc =  Vector.Add(a, {x: aa * dv.x / d, y: aa * dv.y / d});
    const va = vc.Add({x:  h * dv.y / d, y: -h * dv.x / d});
    const vb = vc.Add({x: -h * dv.y / d, y:  h * dv.x / d});

    return {
      va: va,
      vb: vb,
      vc: vc,
      r,
      a: aa,
      h,
    }
  }

  return false;
}

/**
 * 
 * @param {VectorObject} p
 * @param {CircleObject} a 
 * @returns boolean
 */
export function isPointInCircle(p:VectorObject, a:CircleObject) {
  return Vector.Distance(p, a) <= a.r;
}