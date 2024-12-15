import { Shape, RectangleObject } from "@papit/game-shape";
import { VectorObject } from "@papit/game-vector";

export class Rectangle extends Shape implements RectangleObject {
  w: number;
  h: number; 

  constructor(x:number|RectangleObject, y?:number, w?:number, h?:number) {
    super(x, y);
    if (typeof x === "object")
    {
      this.w = x.w;
      this.h = x.h;
    }
    else 
    {
      this.w = w || 1;
      this.h = h || 1;
    }
  }

  get width () {
    return this.w;
  }
  get height () {
    return this.h;
  }

  get boundary() {
    return this;
  }
  supportFunction(direction:VectorObject) {
    return { x: this.x, y: this.y }
  }

  draw(ctx:CanvasRenderingContext2D, strokecolor = "black", fillcolor = "rgba(0,0,0,0.1)") {
    ctx.beginPath();
      ctx.rect(this.x, this.y, this.w, this.h);
      ctx.strokeStyle = strokecolor;
      ctx.stroke();
      if (fillcolor) 
      {
        ctx.fillStyle = fillcolor;
        ctx.fill();
      }
    ctx.closePath();
  }
}