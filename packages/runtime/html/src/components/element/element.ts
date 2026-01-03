import Node from "./node";
import { DOMTokenList } from "./utility";
import type Document from "./document";
import type DocumentType from "./document-type";

import type { Token } from "../tokenise";
import { Builder, Query } from "../util";

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
  get children() { return Array.from(this._childNodes).filter(node => node instanceof Element) }

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
        this._className = Array.from(this._classList ?? []).join(" ")
      });
    }
    return this._classList;
  }

  get tagName() { return this._tagName ?? "" }
  private _tagName:string|null = null;
  set tagName(value:string) { this._tagName = value }

  get innerHTML() {
    if (!this._innerHTML)
    {
      this._innerHTML = this._childNodes.map(child => {
        if (child instanceof Element) return child.outerHTML;
        if (child.nodeType === Node.COMMENT_NODE) return `<!-- ${child.textContent} -->`
        if (child.nodeType === Node.DOCUMENT_TYPE_NODE) return `<!DOCTYPE ${(child as DocumentType).name}>`

        return child.textContent
      }).join("");
    }
    return this._innerHTML;
  }
  private _innerHTML: string|null = null;
  set innerHTML(value:string) {
    this._innerHTML = value;
    this.setHTML(value);
  }

  get outerHTML():string {
    if (!this._outerHTML)
    {
      const attributes = Array.from(this.attributes.keys()).map(key => this.attributes.get(key) === true ? key : `${key}="${this.attributes.get(key)}"`);
      
      const trimmedClassName = this.className.trim();
      const className = trimmedClassName ? ` class="${trimmedClassName}"` : "";
      
      this._outerHTML = `<${this.tagName}${className}${attributes.length ? " " + attributes.join(" ") : ""}`;
    }

    return `${this._outerHTML}${this.innerHTML ? `>${this.innerHTML}</${this.tagName}>` : " />"}`;
  }
  private _outerHTML: string|null = null;

  get id():string {
    const value = this._attributes.get("id");
    if (typeof value === "string") return value;
    return "";
  }
  set id(value: string) { this._attributes.set("id", value) }

  get attributes():Map<string, string|true> { return new Map(this._attributes) };
  private _attributes = new Map<string, string|true>();
  protected set attributes(attributes: Record<string, string|true>) {
    this._attributes = new Map();
    for (const key in attributes)
    {
      this._attributes.set(key, attributes[key]);
    }
  } 

  // expose tokens for whatever reason
  private _tokens: Token[] = [];
  get tokens() { return this._tokens }

  setHTML(value:string) { this._tokens = Builder(this, value) }
  getAttribute(name: string) {
    return this._attributes.get(name);
  }
  setAttribute(name: string, value?: string) {
    this._attributes.set(name, value ? value : true);
    this._outerHTML = null;
  }
  hasAttribute(name: string) {
    return this._attributes.has(name);
  }
  toggleAttribute(name: string) {
    if (this._attributes.has(name)) return this._attributes.delete(name);
    this._attributes.set(name, true);
    this._outerHTML = null;
    return true;
  }
  removeAttribute(name: string) {
    this._outerHTML = null;
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
  querySelector<T extends Element>(selector: string|ReturnType<typeof Query>): T | null {
    const query = Element.getQuery("querySelector", selector);
    return Element.queryInternal<T>(this, query, false);
  }
  querySelectorAll<T extends Element>(selector: string|ReturnType<typeof Query>): T[] {
    const query = Element.getQuery("querySelectorAll", selector);
    return Element.queryInternal<T>(this, query, true);
  }
  closest<T extends Element>(selector: string|ReturnType<typeof Query>): T | null {
    const query = Element.getQuery("closest", selector);

    let current: Element | null = this;

    while (current) {
      if (Element.matches(current, query[0])) {
        return current as T;
      }
      current = current.parentElement;
    }
    
    return null;
  }

  private static getQuery(name: string, selector:string|ReturnType<typeof Query>) {
    if (selector === "") throw new SyntaxError(`Failed to execute '${name}' on 'Element': The provided selector is empty.`);
    if (typeof selector === "string")
    {
      return Query(selector).reverse();
    }

    return selector;
  }
  private static matches(elm: Element, query: ReturnType<typeof Query>[number]): boolean {
    if (query.tag && elm.tagName !== query.tag) return false;
    
    if (query.id && elm.id !== query.id) return false; 

    if (query.class && !elm.classList.contains(query.class)) return false;

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
  private static queryInternal<T extends Element>(target: Element, selector: ReturnType<typeof Query>, all: false): T | null;
  private static queryInternal<T extends Element>(target: Element, selector: ReturnType<typeof Query>, all: true): T[];
  private static queryInternal<T extends Element>(
    target: T,
    selector: ReturnType<typeof Query>,
    all: boolean
  ): T | T[] | null {
    const results: T[] = [];
    const parts = [...selector]; // don’t mutate caller
    const last = parts.pop();
    if (!last) return all ? [] : null;

    const walk = (node: T) => {
      for (const child of node.children) {
        if (child.nodeType !== Node.ELEMENT_NODE) continue;

        const el = child as T;

        if (Element.matches(el, last)) {
          if (parts.length === 0) {
            results.push(el);
            if (!all) return;
          } else {
            // match ancestors backwards
            let current: Element | null = el.parentElement;
            let ok = true;

            for (let i = parts.length - 1; i >= 0; i--) {
              if (!current || !Element.matches(current, parts[i])) {
                ok = false;
                break;
              }
              current = current.parentElement;
            }

            if (ok) {
              results.push(el);
              if (!all) return;
            }
          }
        }

        walk(el);
        if (!all && results.length) return;
      }
    };

    walk(target);

    return all ? results : results[0] ?? null;
  }
}
