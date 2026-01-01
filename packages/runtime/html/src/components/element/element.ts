// import statements 

import { Tokenise } from "../tokenise";
import { CSS } from "./css";
import { Query } from "./query";

export abstract class Node {
  static ELEMENT_NODE = 1;
  static TEXT_NODE = 3;
  static DOCUMENT_NODE = 9;
  
  parent: Node|null = null;
  textContent:string|null = null;
  ownerDocument!: Document;
  nodeType!: number;
}

type ElementOption = {
  parent?: Node;
  className?: string;
  attributes: Record<string, string | true>;
  children?: Node[];
  textContent?: string;
}
export class Element extends Node {
  attributes:Record<string, string|true>;
  nodeType = Node.ELEMENT_NODE;
  tagName: string;
  
  protected _children: Node[] = [];
  protected css: CSS;
  protected _innerHTML: string|undefined;
  protected _outerHTML: string|undefined;
  protected _parentElement: Element | null = null;

  protected constructor(tagName: string, options?: ElementOption) {
    super();
    this.tagName = tagName.toLowerCase().replace(/\s/g, '-');
    this.css = new CSS(options?.className ?? "");
    this.css.addEventListener("change", () => {
      this._outerHTML = undefined;
    });
    this.parent = options?.parent ?? null;
    this._children = options?.children ?? [];
    this.textContent = options?.textContent ?? null;

    this.attributes = new Proxy(options?.attributes ?? {}, {
      set: (target, p, newValue, receiver) => {
        this._outerHTML = undefined;
        return Reflect.set(target, p, newValue, receiver);
      },
    });
  }

  //#region getters and setters 
  // CHILDREN
  get children() {
    return this._children;
  }

  // PARENT 
  get parentElement() {
    return this._parentElement;
  }

  // CLASS 
  get className() {
    return this.css.className;
  }
  get classList() {
    return this.css.classList;
  }

  // ID 
  get id() {
    const { id } = this.attributes;
    if (typeof id === "string") return id;
    return "";
  }
  set id(value: string) {
    this.attributes.id = value;
  }

  // INNER HTML 
  get innerHTML() {
    if (!this._innerHTML)
    {
      this._innerHTML = this.children
        .map(child => {
          if (child.nodeType === Node.TEXT_NODE) return child.textContent;
          return (child as Element).outerHTML;
        })
        .filter(child => child !== null)
        .join("");
    }

    return this._innerHTML;
  }
  set innerHTML(value:string) {
    this._innerHTML = value;

    this._children = [];
    this.textContent = null;
    BuildTree(this.ownerDocument, this, value);
  }

  // OUTER HTML 
  get outerHTML() {
    if (!this._outerHTML)
    {
      const attributes = Object.keys(this.attributes).map(key => this.attributes[key] === true ? key : `${key}="${this.attributes[key]}"`);
      const trimmedClassName = this.className.trim();
      const className = trimmedClassName ? ` class="${trimmedClassName}"` : "";
      
      this._outerHTML = `<${this.tagName}${className}${attributes.length ? " " + attributes.join(" ") : ""}`;
    }

    return `${this._outerHTML}${this.innerHTML ? `>${this.innerHTML}</${this.tagName}>` : " />"}`;
  }
  //#endregion

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

  appendChild(node: Node) {
    this._innerHTML = undefined;
    this.children.push(node);
    if (node instanceof Element) node.setParent(this);
    if (node instanceof TextNode) node.parent = this;
  }
  removeChild(index: number) {
    const element = this.children[index];
    if (!element) return;
    if (element instanceof Element)
    {
      element.setParent(null);
    }
    this._innerHTML = undefined;
    this.children.splice(index, 1);
  }


  //#region helper classes 
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
      const value = elm.attributes[query.attribute.name];
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
  private setParent(parent: Element | null) {
    this._parentElement = parent;
  }
  //#endregion
}

export class TextNode extends Node {
  nodeType = Node.TEXT_NODE;

  constructor(text: string) {
    super();
    this.textContent = text;
  }
}

export class Document extends Element {
  nodeType = Node.DOCUMENT_NODE;
  tagName = "#document";
  
  constructor() {
    super("#document");
  }

  override get innerHTML() {
    return super.innerHTML;
  }

  override set innerHTML(value: string) {
    this._innerHTML = value;

    this._children = [];
    this.textContent = null;
    BuildTree(this, this, value);
  }

  get outerHTML() {
    if (!this._outerHTML)
    {
      this._outerHTML = `#document\n${this.innerHTML}`;
    }

    return this._outerHTML;
  }

  createTextNode(text:string) {
    const node = new TextNode(text);
    node.ownerDocument = this;
    return node;
  }
  createElement(tagName: string, options?: ElementOption) {
    const node = new Element(tagName, options);
    node.ownerDocument = this;
    return node;
  }
}

function BuildTree(dom: Document, root: Element, html:string) {
  const tokens = Tokenise(html);

  const stack: Element[] = [root];

  for (const token of tokens) {
    const current = stack[stack.length - 1];

    switch (token.type) {
      case "text": {
        if (!token.value.trim()) break;
        const node = dom.createTextNode(token.value); 
        node.parent = current;
        current.children.push(node);
        break;
      }

      case "startTag": {
        const el = dom.createElement(token.name, {
          attributes: token.attributes,
          parent: current
        });
        
        current.children.push(el);

        if (!token.selfClosing) {
          stack.push(el);
        }
        break;
      }

      case "endTag": {
        // Pop until matching tag (simple error recovery)
        for (let i = stack.length - 1; i > 0; i--) {
          if (stack[i].tagName === token.name) {
            stack.length = i;
            break;
          }
        }
        break;
      }
    }
  }

  return root;
}