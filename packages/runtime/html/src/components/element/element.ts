import Node from "./node";
import { DOMTokenList } from "./utility";
import type Document from "./document";
import type DocumentType from "./document-type";

import type { Token } from "../tokenise";
import { Builder, Queue } from "../util";
import { Query } from "../query";

type QueryQueue = Queue<ReturnType<typeof Query>[number]>;
export default class Element extends Node {
  public constructor(ownerDocument?: Document, tagName = "") {
    super(ownerDocument);
    this.nodeType = Node.ELEMENT_NODE;
    this._tagName = tagName;
  }

  override appendChild(child: Node): void {
    this._innerHTML = null;
    return super.appendChild(child);
  }
  override removeChild(child: Node): boolean {
    this._innerHTML = null;
    return super.removeChild(child);
  }

  private _children: Element[]|null = null;
  get children() { 
    if (this._children === null || this._dirty.has("children"))
    {
      this._dirty.delete("children");
      this._children = Array.from(this._childNodes).filter(node => node instanceof Element) 
    }

    return this._children;
  }

  get previousElementSibling():Element|null {
    if (!this.parentElement) return null;
    const children = this.parentElement.children;
    const index = this.parentElement.getChildPosition(this);
    return children[index + 1] ?? null;
  }
  get nextElementSibling():Element|null {
    if (!this.parentElement) return null;
    const children = this.parentElement.children;
    const index = this.parentElement.getChildPosition(this);
    return children[index - 1] ?? null;
  }

  get firstElementChild(): Element|null { return this.children.pop() ?? null }
  get lastElementChild(): Element|null { return this.children[0] ?? null }

  private _className: string|null = null;
  get className() { return this._className ?? "" }
  set className(value:string) { 
    this._className = value;
    this._classList = null;
  }

  private _classList: DOMTokenList|null = null;
  get classList() { 
    if (!this._classList) 
    {
      this._classList = new DOMTokenList(this.className.split(" "));
      this._classList.addEventListener("change", () => {
        this._outerHTML = null;
        this.dirty("innerHTML");
        this._className = Array.from(this._classList ?? []).join(" ");
      });
    }
    return this._classList;
  }

  get tagName() { return this._tagName ?? "" }
  private _tagName:string|null = null;
  set tagName(value:string) { this._tagName = value }

  get innerHTML() {
    if (!this._innerHTML || this._dirty.has("innerHTML"))
    {
      this._innerHTML = (!this._dirty.has("textContent") && this._textContent ? this._textContent : "") + this._childNodes.map(child => {
        if (child instanceof Element) return child.outerHTML;
        if (child.nodeType === Node.COMMENT_NODE) return `<!-- ${child.textContent} -->`
        if (child.nodeType === Node.DOCUMENT_TYPE_NODE) return `<!DOCTYPE ${(child as DocumentType).name}>`

        return child.textContent
      }).join("");

      this._dirty.delete("innerHTML");
    }
    return this._innerHTML;
  }
  private _innerHTML: string|null = null;
  set innerHTML(value:string) {
    this._innerHTML = value;
    this._dirty.delete("innerHTML");
    this.dirty("innerHTML");
    this.setHTML(value);
  }

  get outerHTML():string {
    if (!this._outerHTML || this._dirty.has("outerHTML"))
    {
      const attributes = Array.from(this.attributes.keys()).map(key => this.attributes.get(key) === true ? key : `${key}="${this.attributes.get(key)}"`);
      
      const trimmedClassName = this.className.trim();
      const className = trimmedClassName ? ` class="${trimmedClassName}"` : "";
      
      this._outerHTML = `<${this.tagName}${className}${attributes.length ? " " + attributes.join(" ") : ""}`;
      this._dirty.delete("outerHTML");
    }

    return `${this._outerHTML}${this.innerHTML ? `>${this.innerHTML}</${this.tagName}>` : " />"}`;
  }
  private _outerHTML: string|null = null;

  get id():string {
    const value = this._attributes.get("id");
    if (typeof value === "string") return value;
    return "";
  }
  set id(value: string) { 
    this._attributes.set("id", value);
    this._outerHTML = null;
    this.dirty("innerHTML");
  }

  get attributes():Map<string, string|true> { return new Map(this._attributes) };
  private _attributes = new Map<string, string|true>();
  protected set attributes(attributes: Record<string, string|true>) {
    this._attributes = new Map();
    for (const key in attributes)
    {
      this._attributes.set(key, attributes[key]);
    }
    this.dirty("innerHTML");
  } 

  // expose tokens for whatever reason
  private _tokens: Token[] = [];
  get tokens() { return this._tokens }

  setHTML(value:string) { 
    this._tokens = Builder(this, value);
    this._outerHTML = null;
  }
  getAttribute(name: string) {
    return this._attributes.get(name);
  }
  hasAttribute(name: string) {
    return this._attributes.has(name);
  }
  setAttribute(name: string, value?: string) {
    this._attributes.set(name, value ? value : true);
    this._outerHTML = null;
    this._outerHTML = null;
    this.dirty("innerHTML");
  }
  toggleAttribute(name: string) {
    if (this._attributes.has(name)) return this._attributes.delete(name);
    this._attributes.set(name, true);
    this._outerHTML = null;
    this.dirty("innerHTML");
    return true;
  }
  removeAttribute(name: string) {
    this._outerHTML = null;
    this.dirty("innerHTML");
    return this._attributes.delete(name);
  }
  matches(selector: string) {
    const query = Element.getQuery("matches", selector);
    const last = query.pop();
    if (last)
    {
      return Element.matches(this, last);
    }
  }
  querySelector(selector: string|QueryQueue) {
    const queue = Element.getQuery("querySelector", selector);
    // return Element.queryInternal(this, query, false);
    return Element.matchesDeep(this, queue);
  }
  querySelectorAll(selector: string|QueryQueue) {
    const query = Element.getQuery("querySelectorAll", selector);
    // return Element.queryInternal(this, query, true);
  }
  closest(selector: string|QueryQueue) {
    const query = Element.getQuery("closest", selector).pop();
    if (!query) return null;
    
    let current: Element | null = this;

    while (current) {
      if (Element.matches(current, query)) {
        return current;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  private static getQuery(name: string, selector:string|QueryQueue) {
    if (selector === "") throw new SyntaxError(`Failed to execute '${name}' on 'Element': The provided selector is empty.`);
    if (typeof selector === "string")
    {
      return new Queue<ReturnType<typeof Query>[number]>(Query(selector));
    }

    return selector;
  }
  private static matches(elm: Element, query: ReturnType<typeof Query>[number]): boolean {
    if (query.tag && elm.tagName !== query.tag) return false;
    
    if (query.id && elm.id !== query.id) return false; 

    if (query.class && !query.class.every(className => elm.classList.contains(className))) return false;

    if (query.attribute) {
      const value = elm.attributes.get(query.attribute.name);
      if (query.attribute.value !== undefined) {
        if (value !== query.attribute.value) return false;
      } else if (!(query.attribute.name in elm.attributes)) {
        return false;
      }
    }

    if (query.text && !elm.textContent?.startsWith(query.text)) return false;

    return true;
  }
  // private static queryInternal<T extends Element>(target: T, selector: ReturnType<typeof Query>, all: false): T | null;
  // private static queryInternal<T extends Element>(target: T, selector: ReturnType<typeof Query>, all: true): T[];
  // private static queryInternal<T extends Element>(
  //   target: T,
  //   selector: ReturnType<typeof Query>,
  //   all: boolean
  // ): T | T[] | null {

  //   while (selector.length > 0)
  // }

  // private static matchesDeep(element: Element, queue: QueryQueue, firstmatch = true, isdescendant = false): Element|null {
  //   const query = queue.pop();
  //   if (!query) return element;

  //   if (!isdescendant && !Element.matches(element, query)) return null;

  //   if (query.relation === "sibling")
  //   {
  //     if (!element.nextElementSibling) return null;
  //     return this.matchesDeep(element.nextElementSibling, queue.copy());
  //   }

  //   for (const child of element.children)
  //   {
  //     const copy = queue.copy();
  //     const matched = this.matchesDeep(child, copy, false, query.relation === "descendant");
  //     if (matched) return matched;
  //   }

  //   return null;
  // }

  // private static childMatches(
  //   element: Element,
  //   queue: QueryQueue,
  // ) {
  //   const queries = queue.copy(); 
  //   let target = element;

  //   while (queries.length > 0) 
  //   {
  //     let passed = false;
  //     let query = queries.pop()!;

  //     if (!Element.matches(target, query)) return false;

  //     if (query.relation === "sibling")
  //     {
  //       target = 
  //     }

  //     // const next = queries.peek();
      
  //     // for (const child of target.children)
  //     // {
  //     //   if (!Element.matches(child, query)) continue;
  //     //   if (!next) return child;

  //     //   if (next.relation === "sibling")
  //     //   {
  //     //     // we must check the next sibling 
  //     //     passed = false;
  //     //     query = queries.pop()!;
  //     //     continue;
  //     //   }
        
  //     //   passed = true;
  //     //   target = child;
  //     //   break;
  //     // }
      
  //     // if (!passed && query.relation !== "descendant") return false;
  //   }

  //   return target;
  // }
}
