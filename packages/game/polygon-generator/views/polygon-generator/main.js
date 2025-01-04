// core
import { LoadImage } from '@papit/game-engine';

// component
import { Generate } from '@papit/game-polygon-generator';


let canvas;
let ctx;

let canvas_display;
let ctx_display;

window.onload = () => {
  canvas = document.querySelector("canvas#image");
  ctx = canvas.getContext("2d");

  canvas_display = document.querySelector("canvas#display");
  ctx_display = canvas_display.getContext("2d");

  const select = document.querySelector("select");
  if (select) {
    select.onchange = change;
    select.dispatchEvent(new Event("change"));
  }
}

async function change(e) {
  const image = await LoadImage(`images/${e.target.value}.png`);

  let SIZE = 1;
  if (image.width <= 10) SIZE = 30;
  else if (image.width <= 32) SIZE = 10;
  // clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx_display.clearRect(0, 0, canvas.width, canvas.height);

  // generate 
  ctx.drawImage(image, 0, 0, image.width, image.height);
  const polygons = Generate(ctx, image.width, image.height);
  console.log(polygons)

  // draw
  canvas.width = canvas_display.width = image.width * SIZE;
  canvas.height = canvas_display.height = image.height * SIZE;

  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

}