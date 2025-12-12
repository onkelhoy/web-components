// core
import {Engine} from '@papit/game-engine';
import {InputEvents} from "@papit/game-input-events";

// component
import {Matrix, Matrix3, Matrix4, MatrixN, } from '@papit/game-matrix';

window.Matrix = Matrix;
window.Matrix3 = Matrix3;
window.Matrix4 = Matrix4;
window.MatrixN = MatrixN;

let engine, events;

window.onload = () => {
  engine = new Engine("canvas");
  events = new InputEvents(engine.canvas, {mouse: {pointerlock: false}});

  events.on("mouse-up", handlemouseup);
  events.on("mouse-down", handlemousedown);
  events.on("mouse-move", handlemousemove);

  engine.loop(draw); // cool function
}

function draw() {
  engine.ctx.clearRect(0, 0, engine.width, engine.height);
}

// event handlers
function handlemousemove(e) {
  // mouse move
}
function handlemousedown(e) {
  // mouse down 
}
function handlemouseup(e) {
  // mouse up 
}