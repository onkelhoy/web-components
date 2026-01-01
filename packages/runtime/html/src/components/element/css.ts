export class CSS extends EventTarget {

  constructor(className: string) {
    super();
    this.className = className;
  }

  private _className!: string;
  get className() {
    return this._className ?? "";
  }
  set className(value: string) {
    this.dispatchEvent(new Event("change"));
    this._className = value;
    this._classList = new Set(value.split(" "));
  }

  private _classList!: Set<string>;
  get classList() {
    const self = this;

    return new Proxy(this._classList, {
      get(target, prop) {
        if (prop === "add") {
          return (...tokens: string[]) => {
            tokens.forEach(t => target.add(t));
            self.syncClassName();
          };
        }

        if (prop === "remove") {
          return (...tokens: string[]) => {
            tokens.forEach(t => target.delete(t));
            self.syncClassName();
          };
        }

        if (prop === "toggle") {
          return (token: string, force?: boolean) => {
            const shouldAdd = force ?? !target.has(token);
            shouldAdd ? target.add(token) : target.delete(token);
            self.syncClassName();
            return shouldAdd;
          };
        }

        if (prop === "contains") {
          return (token: string) => target.has(token);
        }

        if (prop === "value") {
          return self.className;
        }

        // iteration support (for...of, spread, etc.)
        return Reflect.get(target, prop);
      },
    }) as { 
      toggle(token: string, force?: boolean): boolean,
      contains(token: string): boolean;
      value: string;
    } & Set<string>;
  }


  private syncClassName() {
    this.dispatchEvent(new Event("change"));
    this._className = Array.from(this._classList).join(" ");
  }
}