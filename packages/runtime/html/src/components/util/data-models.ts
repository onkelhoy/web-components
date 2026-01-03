export class List<T> extends EventTarget {
  constructor(protected arr: T[]) {
    super();
  }

  get length() { return this.arr.length }
  item: Array<T>["at"] = (index) => this.arr.at(index);
  entries: Array<T>["entries"] = () => this.arr.entries();
  keys: Array<T>["keys"] = () => this.arr.keys();
  values: Array<T>["values"] = () => this.arr.values();
  forEach: Array<T>["forEach"] = (callback, args) => this.arr.forEach(callback, args);

  [Symbol.iterator]() {
    return this.arr[Symbol.iterator]();
  }
}
export class ExtendedList<T> extends List<T> {
  protected set: Set<T>;
  constructor(arr: T[]) {
    super(arr);
    this.set = new Set(arr);
  }

  private change() {
    this.arr = Array.from(this.set).filter(Boolean);
    this.dispatchEvent(new Event("change"));
  }

  contains: Set<T>["has"] = (value) => this.set.has(value);
  add (...values: T[]) {
    values.forEach(value => this.set.add(value));
    this.change();
  }
  remove(value:T) {
    this.set.delete(value);
    this.change();
  }
  replace(oldToken: T, newToken: T) {
    this.set.delete(oldToken);
    this.set.add(newToken);
    this.change();
  }
  toggle(value:T) {
    if (this.set.has(value)) this.set.delete(value);
    else this.set.add(value);
    this.change();
  }

  [Symbol.iterator]() {
    return this.arr[Symbol.iterator]();
  }
}