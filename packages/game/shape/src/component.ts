import { VectorValue, Vector2 } from "@papit/game-vector";
import { RectangleObject, Vector2Object } from "./types";

export abstract class Shape extends Vector2 {

  // these needs to be implemented in the classes
  abstract get boundary(): RectangleObject;

  /**
   * function used by GJK algorithm to determine furthest point
   * @param {VectorValue} direction 
   * @returns {Vector2Object} support-point
   */
  abstract supportFunction(direction: VectorValue): Vector2Object;
}