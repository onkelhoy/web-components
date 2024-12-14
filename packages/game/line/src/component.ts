import {Vector, VectorObject} from "@papit/game-vector";

// TODO extend Shape for GJK support
export class Line {
  a: Vector;
  b!: Vector;
  _direction!: Vector;

  /**
   * 
   * @param {Vector} a 
   * @param {Vector} b 
   */
  constructor(a:VectorObject, b?:VectorObject) {
    this.a = Vector.toVector(a);
    if (b) {
      this.b = Vector.toVector(a);
      this._direction = Vector.Subtract(b, a);
    }
  }

  get direction () {
    return this._direction;
  }
  set direction (value:Vector) {
    this._direction = value;
    this.b = Vector.Add(this.a, this._direction);
  }

  draw(ctx:CanvasRenderingContext2D, color="black", r = 1) {
    ctx.strokeStyle = color;
    this.a.drawDot(ctx, color, r * 5);

    let a:VectorObject = this.a;
    let b:VectorObject|undefined = undefined;

    if (this.b) {
      this.b.drawDot(ctx, color, r * 5);
      b = this.b;
    }
    else 
    {
      a = {x:this.a.x - this.direction.x * 10_000, y:this.a.y - this.direction.y * 10_000}
      b = {x:this.a.x + this.direction.x * 10_000, y:this.a.y + this.direction.y * 10_000}
    }

    ctx.lineWidth = r;
    ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    ctx.closePath();
  }

  static DirectionLine(a:Vector, direction:Vector) {
    const l = new Line(a);
    l.direction = direction;

    return l;
  } 
}