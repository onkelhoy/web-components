export abstract class Emitter extends EventTarget {
  protected error(type: string, message: string, payload: any) {
    this.dispatchEvent(new CustomEvent("error", { detail: { type, message, payload } }));
  }
  protected debug(type: string, message: string, payload: any) {
    this.dispatchEvent(new CustomEvent("debug", { detail: { type, message, payload } }));
  }

  protected emit<T = any>(type: string, detail: T) {
    this.dispatchEvent(new CustomEvent<T>(type, { detail }));
  }
}