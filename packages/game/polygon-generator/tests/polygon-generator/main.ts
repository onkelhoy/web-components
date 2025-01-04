// import { Generate } from "@papit/game-polygon-generator";
import { Engine } from "@papit/game-engine";

let canvas;
let ctx;
window.onload = () => {
  canvas = document.querySelector("canvas");
  ctx = canvas.getContext("2d");

  const btn = document.querySelector("button");
  if (btn) {
    btn.onclick = run;
  }
}

(engine.ctx as CanvasRenderingContext2D).drawImage(new Image())
async function run() {
  const imageCase = canvas.getAttribute("data-image-case");
  const image = new Image();
  image.src = `images/${imageCase}.png`;

  
}

