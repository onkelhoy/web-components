import { Shape, CircleObject } from "@papit/game-shape";
import {Vector, VectorObject } from "@papit/game-vector";

export class Circle extends Shape implements CircleObject {
  r: number;
  
  constructor(x:number|CircleObject, y?:number, r?:number) {
    super(x, y);
    if (typeof x === "object")
    {
      this.r = x.r;
    }
    else 
    {
      this.r = r || 1;
    }
  }

  get boundary() {
    return {
      x: this.x - this.r,
      y: this.y - this.r,
      w: this.r * 2,
      h: this.r * 2,
    };
  }
  supportFunction(direction: VectorObject): VectorObject {
    const angle = Vector.Angle(direction);
    return this.add(Math.cos(angle) * this.r, Math.sin(angle) * this.r);
  }

  draw(ctx: CanvasRenderingContext2D, strokecolor = "black", fillcolor="rgba(0,0,0,0.1)") {
    ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
      ctx.strokeStyle = strokecolor;
      ctx.fillStyle = fillcolor;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fill();
    ctx.closePath();
  }

  static toCircle(value:CircleObject, r:number) {
    const c = new Circle(value);
    c.r = r;

    return c;
  }
}