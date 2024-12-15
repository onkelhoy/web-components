import {Vector, VectorObject} from "@papit/game-vector";
import {RectangleObject} from "./types";

export abstract class Shape extends Vector {

  // these needs to be implemented in the classes
  abstract get boundary():RectangleObject;

  /**
   * function used by GJK algorithm to determine furthest point
   * @param {Vector} direction 
   * @returns {Vector} support-point
   */
  abstract supportFunction(direction:VectorObject):VectorObject;
}