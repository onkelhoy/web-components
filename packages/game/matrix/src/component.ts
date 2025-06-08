// import statements 

import { Vector, Vector3Object, VectorObject } from "@papit/game-vector";

export class Matrix {
  private _data: number[] = [];
  get data() {
    return this._data;
  }
  set data(value:number[]) {
    if (this.row * this.col !== value.length) throw new Error("[matrix] error: dimensions do not match the supplied data");
  }
  col: number;
  row: number;

  constructor(data: number[], row:number, col:number) {
    this.row = row;
    this.col = col;
    this.data = data;
  }

  multiplyScalor(v:number) {
    this._data.forEach((a, i) => {
      this._data[i] = a * v;
    });
  }
  addScalor(v:number) {
    this._data.forEach((a, i) => {
      this._data[i] = a + v;
    });
  }
  transpose() {
    const transposedData: number[] = [];
    for (let i = 0; i < this.col; i++) {
      for (let j = 0; j < this.row; j++) {
        transposedData.push(this.get(j, i)); // Swap row and column indices
      }
    }
  
    return new Matrix(transposedData, this.col, this.row);
  }

  get(row: number, col: number) {
    if (!(row >= 0 && row <= this.row)) throw new Error("[matrix] error: row is not within bounds");
    if (!(col >= 0 && col <= this.col)) throw new Error("[matrix] error: col is not within bounds");

    return this._data[row * this.col + col];
  }

  multiply(m:Matrix|VectorObject|number) {
    if (typeof m === "number") {
      this.multiplyScalor(m);
      return;
    }

    if ('x' in m) {
      m = Matrix.FromVector(m);
    }

    if (this.row !== m.col) throw new Error("[matrix] error: dimensions must be the same");

    const data:number[] = [];
    for (let i = 0; i < this.row; i++) {
      for (let j = 0; j < m.col; j++) {
        for (let k = 0; k < this.col; k++) {
          data[i * m.col + j] += this._data[i * this.col + k] * m.data[k * m.col + j];
        }
      }
    }

    this._data = data;
    this.col = m.col;
  }

  copy() {
    return new Matrix([...this._data], this.row, this.col);
  }

  static Multiply(a:Matrix, b:Matrix) {
    const copy = a.copy();
    copy.multiply(b);

    return copy;
  }

  static Identity(size:number) {
    const data = new Array(size * size).fill(0).map((v, i) => {
      const col = i % size;
      const row = Math.floor(i / size);

      return row === col ? 1 : 0
    });

    return new Matrix(data, size, size);
  }

  static FromVector(v:VectorObject) {
    const data = [v.x, v.y];
    if (v.z !== undefined) data.push(v.z);

    return new Matrix(data, 1, data.length);
  }

  static m3:m3;
  static m4:m4;
}

// CRED: https://webgl2fundamentals.org/webgl/lessons/webgl-2d-matrices.html
export class m3 extends Matrix {

  constructor(data:number[]) {
    super(data, 3, 3);
  }

  static translation(x: number, y: number) {
    return new m3([
      1, 0, 0,
      0, 1, 0,
      x, y, 1,
    ]);
  }
  static rotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);

    return new m3([
      c,-s, 0,
      s, c, 0,
      0, 0, 1,
    ]);
  }
  static scaling(x: number, y: number) {
    return new m3([
      x, 0, 0,
      0, y, 0,
      0, 0, 1,
    ]);
  }
  static projection(width:number, height:number) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return new m3([
      2 / width, 0, 0,
      0, -2 / height, 0,
      -1, 1, 1
    ]);
  }
  static identity() {
    return new m3([
      1, 0, 0,
      0, 1, 0,
      0, 0, 1,
    ]);
  }

  translate(tx:number, ty:number) {
    return this.multiply(m3.translation(tx, ty));
  }
  rotate(angleInRadians:number) {
    return this.multiply(m3.rotation(angleInRadians));
  }
  scale(sx:number, sy:number) {
    return this.multiply(m3.scaling(sx, sy));
  }
}

// CRED: https://webgl2fundamentals.org/webgl/lessons/webgl-3d-orthographic.html
export class m4 extends Matrix {
  constructor(data:number[]) {
    super(data, 4, 4);
  }

  static translation(tx:number, ty:number, tz:number) {
    return new m4([
       1,  0,  0,  0,
       0,  1,  0,  0,
       0,  0,  1,  0,
       tx, ty, tz, 1,
    ]);
  }
  static xRotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
 
    return new m4([
      1, 0, 0, 0,
      0, c, s, 0,
      0, -s, c, 0,
      0, 0, 0, 1,
    ]);
  }
  static yRotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
 
    return new m4([
      c, 0, -s, 0,
      0, 1, 0, 0,
      s, 0, c, 0,
      0, 0, 0, 1,
    ]);
  }
  static zRotation(angleInRadians:number) {
    var c = Math.cos(angleInRadians);
    var s = Math.sin(angleInRadians);
 
    return new m4([
       c, s, 0, 0,
      -s, c, 0, 0,
       0, 0, 1, 0,
       0, 0, 0, 1,
    ]);
  }
  static scaling(sx:number, sy:number, sz:number) {
    return new m4([
      sx, 0,  0,  0,
      0, sy,  0,  0,
      0,  0, sz,  0,
      0,  0,  0,  1,
    ]);
  }
  static orthographic(left:number, right:number, bottom:number, top:number, near:number, far:number) {
    return new m4([
      2 / (right - left), 0, 0, 0,
      0, 2 / (top - bottom), 0, 0,
      0, 0, 2 / (near - far), 0,
 
      (left + right) / (left - right),
      (bottom + top) / (bottom - top),
      (near + far) / (near - far),
      1,
    ]);
  }
  static projection(width:number, height:number, depth:number) {
    // Note: This matrix flips the Y axis so 0 is at the top.
    return new m4([
       2 / width, 0, 0, 0,
       0, -2 / height, 0, 0,
       0, 0, 2 / depth, 0,
      -1, 1, 0, 1,
    ]);
  }
  static perspective(fieldOfViewInRadians:number, aspect:number, near:number, far:number) {
    var f = Math.tan(Math.PI * 0.5 - 0.5 * fieldOfViewInRadians);
    var rangeInv = 1.0 / (near - far);
 
    return new m4([
      f / aspect, 0, 0, 0,
      0, f, 0, 0,
      0, 0, (near + far) * rangeInv, -1,
      0, 0, near * far * rangeInv * 2, 0
    ]);
  }
  static lookAt(cameraPosition:Vector3Object, target:Vector3Object, up:Vector3Object) {
    var zAxis = Vector.Subtract(cameraPosition, target).normalise();
    var xAxis = Vector.Cross(up, zAxis).normalise();
    var yAxis = Vector.Cross(zAxis, xAxis).normalise();
 
    return new m4([
      xAxis.x, xAxis.y, xAxis.z, 0,
      yAxis.x, yAxis.y, yAxis.z, 0,
      zAxis.x, zAxis.y, zAxis.z, 0,
      cameraPosition.x,
      cameraPosition.y,
      cameraPosition.z,
      1,
    ]);
  }
  static identity() {
    return new m4([
      1, 0, 0, 0,
      0, 1, 0, 0,
      0, 0, 1, 0,
      0, 0, 0, 1,
    ]);
  }

  translate(tx:number, ty:number, tz:number) {
    return this.multiply(m4.translation(tx, ty, tz));
  }
  xRotate(angleInRadians:number) {
    return this.multiply(m4.xRotation(angleInRadians));
  }
  yRotate(angleInRadians:number) {
    return this.multiply(m4.yRotation(angleInRadians));
  }
  zRotate(angleInRadians:number) {
    return this.multiply(m4.zRotation(angleInRadians));
  }
  scale(sx:number, sy:number, sz:number) {
    return this.multiply(m4.scaling(sx, sy, sz));
  }
}