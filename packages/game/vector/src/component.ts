import { VectorObject, PrintSettings, DEFAULT_PRINT_SETTINGS } from "./types";

export class Vector implements VectorObject {
  x: number;
  y: number;
  z: number;

  constructor(x: number|VectorObject, y: number = 0, z:number = 0) {
    if (typeof x === "object")
    {
      this.x = x.x || 0;
      this.y = x.y || 0;
      this.z = x.z || 0;
    }
    else 
    {
      this.x = x;
      this.y = y;
      this.z = z;
    }
  }

  get magnitude() {
    return Vector.Magnitude(this);
  }
  get angle() {
    return Math.atan2(this.y, this.x);
  }

  set magnitude(value) {
    const angle = this.angle;
    this.x = Math.cos(angle) * value;
    this.y = Math.sin(angle) * value;
  }
  set angle(value) {
    const mag = this.magnitude;
    this.x = Math.cos(value) * mag;
    this.y = Math.sin(value) * mag;
  }

  // affectors
  /**
   * Sets vector to value
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  set(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x = vv.x;
    this.y = vv.y;
    this.z = vv.z;

    return this;
  }
  /**
   * Adds another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  add(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x += vv.x;
    this.y += vv.y;
    this.z += vv.z;

    return this;
  }
  /**
   * Subtracts another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  sub(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x -= vv.x;
    this.y -= vv.y;
    this.z -= vv.z;

    return this;
  }
  /**
   * Divides another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  divide(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x /= vv.x;
    this.y /= vv.y;
    this.z /= vv.z;

    return this;
  }
  /**
   * Multiplies another vector to original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns Vector
   */
  mul(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    this.x *= vv.x;
    this.y *= vv.y;
    this.z *= vv.z;

    return this;
  }

  // copy
  /**
   * Adds 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Add(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x += vv.x;
    copy.y += vv.y;
    copy.z += vv.z;

    return copy;
  }
    /**
   * Subtracts 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Sub(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x -= vv.x;
    copy.y -= vv.y;
    copy.z -= vv.z;

    return copy;
  }
  /**
   * Divides 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Divide(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x /= vv.x;
    copy.y /= vv.y;
    copy.z /= vv.z;

    return copy;
  }
  /**
   * Multiplies 2 vectors without modifying the original
   * @param {Vector|number} v 
   * @param {undefined|number} y 
   * @param {undefined|number} z 
   * @returns new Vector
   */
  Mul(v: VectorObject|number, y = 0, z = 0) {
    const vv = Vector.toVector(v, y, z);
    const copy = Vector.Copy(this);
    copy.x *= vv.x;
    copy.y *= vv.y;
    copy.z *= vv.z;

    return copy;
  }
  get opposite() {
    return this.mul(-1);
  }
  get Opposite() {
    return Vector.toVector(this).opposite;
  }

  normalise() {
    const mag = this.magnitude;
    if (mag >= 0.00001) {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
    }
    else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }

    return this;
  }

  toString(settings?:Partial<PrintSettings>) {
    const _settings = {
      ...DEFAULT_PRINT_SETTINGS,
      ...(settings||{}),
    }
    let print = '';
    if (_settings.round) print = `${Math.round(this.x * 100) / 100}, ${Math.round(this.y * 100) / 100}`;
    else print = `${this.x}, ${this.y}`;
    if (_settings.z) 
    {
      if (_settings.round) print += ", "+ Math.round(this.z * 100) / 100;
      else print += ", " + this.z;
    }
    return `[${print}]`;
  }

  dot(b:VectorObject) {
    return this.x * b.x + this.y * b.y + this.z * (b.z||1);
  }

  draw(ctx:CanvasRenderingContext2D, color = "black") {
    this.drawDot(ctx, color);
  }
  drawDot(ctx:CanvasRenderingContext2D, color = "black", r:number = 1) {
    ctx.beginPath();
      ctx.arc(this.x, this.y, r/2, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    ctx.closePath();
  }

  copy() {
    return new Vector(this.x, this.y, this.z);
  }
  
  // static function 
  // mathematical
  static Multiply(a:VectorObject, b:VectorObject) {
    return new Vector(a).mul(b);
  }
  static Divide(a:VectorObject, b:VectorObject) {
    return new Vector(a).divide(b);
  }
  static Add(a:VectorObject, b:VectorObject) {
    return new Vector(a).add(b);
  }
  static Subtract(a:VectorObject, b:VectorObject) {
    return new Vector(a).sub(b);
  }
  static CrossProduct(a:VectorObject, b:VectorObject) {
    return new Vector(
      a.y * (b.z||1) - (a.z || 1) * b.y,
      (a.z || 1) * b.x - a.x * (b.z||1),
      a.x * b.y - a.y * b.x,
    )
  }
  static Cross(a:VectorObject, b:VectorObject) {
    let x = 0;
    let y = 0;
    if (a.z !== undefined && b.z !== undefined) {
      x = a.y * b.z - a.z * b.y;
      y = a.z * b.x - a.x * b.z;
    }
    return new Vector(x, y, a.x * b.y - a.y * b.x);
  }
  static Magnitude(v:VectorObject) {
    return Math.sqrt(v.x*v.x + v.y*v.y);
  }
  static Distance(a:VectorObject, b:VectorObject) {
    return Vector.Subtract(a, b).magnitude;
  }
  static Perpendicular(a:VectorObject, b:VectorObject, windingorder="clickwise") {
    const v = Vector.Subtract(b, a);
    if (windingorder === "clockwise") return new Vector(-v.y, v.x);
    return new Vector(v.y, -v.x);
  }
  static Normalise(v:VectorObject) {
    const copy = new Vector(v);
    copy.normalise();
    return copy;
  }
  static Dot(a:VectorObject, b:VectorObject) {
    return Vector.toVector(a).dot(b);
  }
  static Angle(v:VectorObject) {
    return Math.atan2(v.y, v.x);
  }

  // basic functions
  static toVector(v: VectorObject|number, y = 0, z = 0) {
    if (typeof v === "number") 
    {
      return new Vector(v, y ?? v, z ?? v);
    }

    if (v instanceof Vector) 
    {
      return v;
    }
    if (typeof v === "object")
    {
      return new Vector(v);
    }

    throw new Error(`This ${v} could not be reshaped into a vector`);
  }
  static Copy(v:VectorObject) {
    return new Vector(v);
  }
  static get Zero() {
    return new Vector(0, 0, 0);
  }
  static get Random() {
    return new Vector(
      -1 + Math.random() * 2, 
      -1 + Math.random() * 2, 
      -1 + Math.random() * 2,
    );
  }

  static Draw(v:VectorObject, ctx:CanvasRenderingContext2D, color = "black", r = 1) {
    const vv = Vector.toVector(v);
    vv.drawDot(ctx, color, r);
  }
}