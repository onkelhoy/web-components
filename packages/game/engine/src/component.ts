/**
 * @file this file is dedicated for all canvas related functionalities - this is rather simple 
 * @module engine
 * @author Henry Pap [onkelhoy@gmail.com]
 */

import { Setting, SettingCallback } from "./types";

/**
 * @typedef {object} EngineSettings
 * @property {string} [query]
 * @property {string} [type=2d]
 * @property {number} [width] 
 * @property {number} [height] 
 * @property {Function[]} [callbacks] 
 */

export class Engine {

  info: {
    setting: Setting;
    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
  }[];

  /**
   * 
   * @param  {...string|EngineSettings} selectors 
   */
  constructor(...selectors:(Partial<Setting>|string)[]) {
    // allows for multiple canvases to exist
    this.info = [];
    if (selectors.length === 0) selectors.push('canvas');
    for (const selector of selectors)
    {
      const setting:Setting = {
        query: "",
        type: "2d",
        width: window.innerWidth,
        height: window.innerHeight,
        timer: null,
        previous: null,
        callbacks: [],
        documentElemenet: document:
      }
      if (typeof selector === "string")
      {
        setting.query = selector;
      }
      else 
      {
        setting.query = selector.query ?? "";
        setting.type = selector.type ?? "2d";
        setting.width = selector.width ?? window.innerWidth;
        setting.height = selector.height ?? window.innerHeight;
        setting.callbacks = selector.callbacks ?? [];
        setting.documentElemenet = selector.documentElemenet ?? document;
      }
      const element = setting.documentElemenet.querySelector<HTMLCanvasElement>(setting.query);
      if (!element) throw new Error(`[error engine] could not find element: [${setting.query}]`);
      const context = element.getContext(setting.type);
      if (!context) throw new Error('[error engine] could not create rendering context');
      element.width = setting.width;
      element.height = setting.height;

      this.info.push({
        setting,
        element,
        context,
      })
    }
  }

  get canvas () {
    return this.getCanvas(0);
  }
  get element () {
    return this.getCanvas(0);
  }
  get setting() {
    return this.getSetting(0);
  }
  get context() {
    return this.getContext(0);
  }
  get ctx() {
    return this.getContext(0);
  }

  get width () {
    return this.canvas.width;
  }
  get height () {
    return this.canvas.height;
  }

  getSetting(index:number) {
    return this.info[index]?.setting;
  }
  getContext(index:number) {
    return this.info[index]?.context;
  }
  getElement(index:number) {
    return this.info[index]?.element;
  }
  getCanvas(index:number) { // this is mostly there as I'd probably forget about element : but element makes more sense as a name
    return this.info[index]?.element;
  }

  loop(callback:SettingCallback, index = 0) {
    const setting = this.getSetting(index);

    const loopfunction = () => {
      let delta = -1;
      const now = performance.now();
      if (setting.previous)
      {
        delta = now - setting.previous;
      }
      setting.previous = now;
      if (callback) callback(delta);
      setting.callbacks.forEach(cb => cb(delta)); 
      this.info[index].setting.timer = requestAnimationFrame(loopfunction);
    }

    loopfunction();
  }
  stop(index:number = 0) {
    const setting = this.getSetting(index);
    if (setting.timer) cancelAnimationFrame(setting.timer);
  }
}


export function LoadImage(src:string) {
  return new Promise(res => {
    const img = new Image();
    img.src = src;
    img.onload = () => {
      res(img);
    }
  });
}