// core
import { Engine } from '@papit/game-engine';
import { Vector } from '@papit/game-vector';
import { InputEvents } from "@papit/game-input-events";

// component
import '@papit/game-input-events';

let engine, events, moving = false, sub;

const ball = {
  x: 300,
  y: 300,
  r: 40,
}

window.onload = () => {
  engine = new Engine("canvas");
  events = new InputEvents(engine.canvas, { mouse: { pointerlock: false } });

  events.on("mouse-up", handlemouseup);
  events.on("mouse-down", handlemousedown);
  events.on("mouse-move", handlemousemove);

  engine.loop(draw); // cool function
}



function draw() {
  if (moving) {
    ball.x = events.position.x + sub.x;
    ball.y = events.position.y + sub.y;
  }

  engine.ctx.clearRect(0, 0, engine.width, engine.height);

  engine.ctx.beginPath();
  engine.ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
  engine.ctx.fillStyle = "orange";
  engine.ctx.fill();
}

// event handlers
function handlemousemove(e) {
  // mouse move
}
function handlemousedown(e) {
  // mouse down 
  // mouse up 
  sub = Vector.Subtract(ball, events.position);
  const d = sub.magnitude;
  if (d <= ball.r) {
    moving = true;
  }
}
function handlemouseup(e) {
  moving = false;
}