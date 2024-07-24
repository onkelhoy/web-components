import { Devices } from "../types";

export function debounce<T extends (...args: any[]) => any>(
  execute: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;

  return function (this: ThisParameterType<T>, ...args: Parameters<T>) {
    if (timer) {
      clearTimeout(timer);
    }

    timer = setTimeout(() => {
      execute.apply(this, args);
      timer = null;
    }, delay);
  };
}

export function generateUUID() {
  let d = new Date().getTime();
  if (typeof performance !== 'undefined' && typeof performance.now === 'function') {
    d += performance.now(); //use high-precision timer if available
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = (d + Math.random() * 16) % 16 | 0;
    d = Math.floor(d / 16);
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });
}

export function NextParent<T = HTMLElement>(element: HTMLElement) {
  if (element.parentElement) return element.parentElement;
  const root = element.getRootNode();
  if (root) return (root as any).host as T;
  return null;
}

export function CumulativeOffset(element: HTMLElement) {
  let top = 0, left = 0;
  do {
    top += element.offsetTop || 0;
    left += element.offsetLeft || 0;
    element = element.offsetParent as HTMLElement;
  } while (element);

  return {
    top: top,
    left: left
  };
};

export function ExtractSlotValue(slot: HTMLSlotElement) {
  const nodes = slot.assignedNodes();

  const values: Array<string> = [];
  nodes.forEach(node => appendLeafValue(node, values))

  return values;
}

function appendLeafValue(node: Node, L: Array<string>) {
  if (node.hasChildNodes()) {
    node.childNodes.forEach(child => appendLeafValue(child, L));
  }
  else if (node.textContent) {
    if (node.textContent.trim() === "") return;
    L.push(node.textContent);
  }
}

export function FormatNumber(num: number) {
  if (Math.abs(num) < 1_000) {
    return num.toString();
  }
  else if (Math.abs(num) < 1_000_000) {
    return Math.round((num * 10) / 1_000) / 10 + 'k';
  }
  else if (Math.abs(num) < 1_000_000_000) {
    return Math.round((num * 10) / 1_000_000) / 10 + 'm';
  }
  else if (Math.abs(num) < 1_000_000_000_000) {
    return Math.round((num * 10) / 1_000_000_000) / 10 + 'bn';
  }
  else {
    return Math.round((num * 10) / 1_000_000_000_000) / 10 + 'tn';
  }
}

export function DetectDevice(component: HTMLElement): Devices {
  if (component.classList.contains("mobile")) return "mobile";

  // do fancy checks
  // console.log(window.navigator.userAgent, window.navigator.mediaCapabilities, window.navigator.languages)

  const computed = window.getComputedStyle(component);
  const desktop = Number(computed.getPropertyValue("--breakpoint-desktop")?.replace('px', '')) || 320;
  const laptop = Number(computed.getPropertyValue("--breakpoint-laptop")?.replace('px', '')) || 768;
  const pad = Number(computed.getPropertyValue("--breakpoint-pad")?.replace('px', '')) || 1024;
  // const mobile = Number(computed.getPropertyValue("--breakpoint-mobile")?.replace('px', '')) || 1440;

  // finally do basic checks
  if (window.innerWidth > desktop) {
    return "desktop";
  }
  else if (window.innerWidth > laptop) {
    return "laptop";
  }
  else if (window.innerWidth > pad) {
    return "pad";
  }
  else {
    return "mobile";
  }
}

// value manipulation 
export function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

export function lerpValue(value: number, min: number, max: number, newmin: number, newmax: number) {
  // Normalize 'value' to a [0, 1] range
  const t = (value - min) / (max - min);
  // Interpolate this normalized value to the new range
  return Math.min(newmax, Math.max(lerp(newmin, newmax, t), newmin));
}