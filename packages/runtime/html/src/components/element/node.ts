import { NodeList } from "./utility";
import type Document from "./document";
import type Element from "./element";

export default abstract class Node extends EventTarget {
  constructor(ownerDocument?:Document) {
    super();
    if (ownerDocument)
      this._ownerDocument = ownerDocument;
  }

  static ELEMENT_NODE = 1 as const;
  static TEXT_NODE = 3 as const;
  static CDATA_SECTION_NODE = 4 as const;
  static COMMENT_NODE = 8 as const;
  static DOCUMENT_NODE = 9 as const;
  static DOCUMENT_TYPE_NODE = 10 as const;

  get ownerDocument() { return this._ownerDocument }
  private _ownerDocument!: Document;
  protected set ownerDocument(DOM: Document) { this._ownerDocument = DOM }

  get nodeName() { return this._nodeName }
  private _nodeName!: string;
  protected set nodeName(name: string) { this._nodeName = name }

  get nodeType() { return this._nodeType }
  private _nodeType!: 1|3|4|8|9|10;
  protected set nodeType(value: 1|3|4|8|9|10) { 
    this._nodeType = value;

    switch (value) {
      case Node.ELEMENT_NODE:
        this._nodeName = "ELEMENT_NODE";
        break;
      case Node.TEXT_NODE:
        this._nodeName = "TEXT_NODE";
        break;
      case Node.CDATA_SECTION_NODE:
        this._nodeName = "CDATA_SECTION_NODE";
        break;
      case Node.COMMENT_NODE:
        this._nodeName = "COMMENT_NODE";
        break;
      case Node.DOCUMENT_NODE:
        this._nodeName = "DOCUMENT_NODE";
        break;
      case Node.DOCUMENT_TYPE_NODE:
        this._nodeName = "DOCUMENT_TYPE_NODE";
        break;
    }
  }

  get parentNode() { return this._parentNode };
  private _parentNode: Node|null = null;
  protected set parentNode(value: Node|null) { this._parentNode = value }

  protected _childNodes:Node[] = [];
  protected set childNodes(value: Node[]) { this._childNodes = value }
  get childNodes(): NodeList { return new NodeList(this._childNodes) }
  get lastChild(): Node|null { return this._childNodes[this._childNodes.length - 1] ?? null }
  get firstChild(): Node|null { return this._childNodes[0] ?? null }

  protected getChildPosition(child:Node) { return this._childNodes.findIndex(node => node === child) } 
  get nextSibling(): Node|null { 
    if (!this.parentNode) return null;
    return this.parentNode._childNodes[this.parentNode.getChildPosition(this) + 1] ?? null 
  }
  get previousSibling(): Node|null { 
    if (!this.parentNode) return null;
    return this.parentNode._childNodes[this.parentNode.getChildPosition(this) - 1] ?? null 
  }

  get parentElement() { return this._parentElement };
  private _parentElement: Element|null = null;
  protected set parentElement(value: Element|null) { this._parentElement = value }

  get textContent() {
    if (!this._textContent)
    {
      this._textContent = Array.from(this._childNodes).map(child => child.textContent).join(" ").trim();
    }
    return this._textContent;
  }
  protected _textContent: string|null = null;
  set textContent(value: string) { 
    this._childNodes.forEach(this.removeChild);
    this._textContent = value.trim();
  }

  appendChild(child: Node) {
    child.parentNode = this;
    child.ownerDocument = this.ownerDocument;
    if (this.nodeType === Node.ELEMENT_NODE) 
    {
      child.parentElement = this as unknown as Element;
    }
    this._childNodes.push(child);
  }
  removeChild(child: Node) {
    const index = this._childNodes.findIndex(c => c == child);
    if (index < 0) return false;

    child._parentNode = null;
    child._parentElement = null;
    return this._childNodes.splice(index, 1).length > 0;
  }
}