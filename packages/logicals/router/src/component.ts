// system 
import { CustomElement, property, html, NextParent, context, debounce } from "@papit/core";

// local imports
import { URL, Mapping, PrepareElement, PrepareElementType, Params } from "./types";
import { tidy, join, format, clearHash } from "./url";

/**
 * NOTE:: dom needs to be placed outside of the webcomponent in order to "trigger" the style + scripts 
 * as normally the html 
 */
export class Router extends CustomElement {

  // properties
  @property({
    rerender: false,
    after: function (this: Router, value: string, old: undefined | string) {
      if (!this.internal) {
        if (old === undefined) {
          this.initiateurl();
        }
        else {
          this.mapURL();
        }
      }

      this.internal = false;
    }
  }) url!: string;
  @property({
    type: Object,
    attribute: false,
    rerender: false,
    after: function (this: Router) {
      if (this.updateurl && !this.popstatechange && !this.child) {

        if (this.firststate) {
          window.history.replaceState({ path: this.mappedURL.path }, '', this.mappedURL.browser_url)
          this.firststate = false;
        }
        else {
          // Push the new state into the history
          window.history.pushState({ path: this.mappedURL.path }, '', this.mappedURL.browser_url);
        }
      }
      this.popstatechange = false;

      try {
        this.gethtml();
      }
      catch (error) {
        console.error("[router]", error);
      }
    }
  }) mappedURL!: URL;

  @property({
    type: Boolean,
    rerender: false,
    attribute: "hash-based",
    after: function (this: Router) {
      this.initiateurl();
    }
  }) hashbased!: boolean;
  @property({ type: Array, rerender: false, attribute: false }) omitters: string[] = ["[data-server-omitter]"];
  @property({ type: Boolean, rerender: false }) cache: boolean = false;
  @property({ type: Boolean, rerender: false, attribute: "update-title" }) updatetitle: boolean = true;
  @property({ type: Boolean, rerender: false, attribute: "update-url" }) updateurl: boolean = true;
  @property({ type: Array, rerender: false, attribute: false }) mappings: Mapping[] = [];
  @property({ type: Boolean, rerender: false, attribute: "trailing-slash" }) trailingslash = true;
  @property({ type: Boolean, context: true, rerender: false, attribute: false }) parent = true;

  // contexts 
  @context({ name: "parent" }) child: boolean = false; // this should be flicked to true by "parent" if this router is nested in another router.. (should)

  // elements
  public dom!: HTMLDivElement;
  public head!: HTMLDivElement;
  public body!: HTMLDivElement;

  // variables 
  private parser: DOMParser;
  private encoder: TextEncoder;
  private sources: Set<string> = new Set();
  private abortcontrollers: Set<AbortController> = new Set();
  private popstatechange = false;
  private browser_url?: string = undefined;
  private internal = false;
  private firststate = true;


  get params() {
    return this.mappedURL.params;
  }

  constructor() {
    super();
    this.parser = new DOMParser();
    this.encoder = new TextEncoder();

    this.initiateurl = debounce(this.initiateurl, 150);
  }

  // class functions 
  firstRender(): void {
    super.firstRender();
    const parent = NextParent(this);
    if (parent) {
      this.dom = document.createElement("div");
      this.dom.id = crypto.randomUUID();

      this.head = document.createElement("div");
      this.head.className = "router-head";
      this.dom.appendChild(this.head);

      this.body = document.createElement("div");
      this.body.className = "router-body"
      this.dom.appendChild(this.body);

      parent.appendChild(this.dom);
      this.gethtml(); // this will always be the initial render 
    }

    this.initiateurl();
  }
  connectedCallback(): void {
    super.connectedCallback();

    window.addEventListener("popstate", this.handlewindowpopstate);
  }
  disconnectedCallback(): void {
    super.disconnectedCallback();

    this.abortcontrollers.forEach(control => control.abort("router disconnected"));
    this.abortcontrollers.clear();
    window.removeEventListener("popstate", this.handlewindowpopstate);
  }
  render() {
    return html`
      <slot @slotchange="${this.handleslotchange}"></slot>
    `;
  }

  // event handlers 
  private handleslotchange = (e: Event) => {
    if (e.target instanceof HTMLSlotElement) {
      const assignedElements = e.target.assignedElements();

      for (let element of assignedElements) {
        if (element instanceof HTMLElement) {
          if (element.hasAttribute("path")) {
            const path = element.getAttribute("path") || "";
            const realpath = element.getAttribute("realpath") || path;

            this.mappings.push({ path, realpath })
          }
        }
      }
    }
  }
  private handlewindowpopstate = (event: PopStateEvent) => {

    if (event.state?.path) {
      // Handle state restoration here
      this.popstatechange = true;
      this.url = event.state.path;
    }
    else {
      this.cleanup();
    }
  }

  // helper functions 
  private cleanup() {
    this.body.innerHTML = "";
    this.head.innerHTML = "";
  }
  private initiateurl = () => {
    let browser_url = tidy(window.location.pathname);
    let url = tidy(this.url);

    if (this.url === undefined) {
      this.internal = true;
      this.url = url;
    }

    if (!url.startsWith(browser_url)) {
      // this means url is set aside from browser_url thus found initial browser_url
      this.browser_url = browser_url;
    }

    if (!this.hashbased) {
      this.hashbased = false;
    }

    this.mapURL();
  }
  private mapURL() {
    let browser_url = this.browser_url || "";
    let url = tidy(this.url);

    if (this.url === undefined) {
      this.internal = true;
      this.url = url;
    }

    if (this.hashbased) {
      if (url === "") url = tidy(window.location.hash.replace("#", ""));
      browser_url += "/#"
    }

    const output: URL = {
      request_url: clearHash(join(this.browser_url || "", url), this.trailingslash), // formatted real-path 
      browser_url: format(join(browser_url, url), this.trailingslash), // the url  (turns all variables into values)
      path: clearHash(url, this.trailingslash), // can include variables -> /hello/:world/foo
      params: {}, // aaand params.. 
    }

    const urlsplit = url.split("/");
    for (let mapping of this.mappings) {
      const params: Params = {};
      const split = mapping.path.split("/");
      let match = urlsplit.length === split.length;
      const _browser_url: string[] = [browser_url]

      if (!match) continue;
      for (let i = 0; i < urlsplit.length; i++) {
        if (split[i].startsWith(":")) {
          // dynamic
          _browser_url.push(urlsplit[i]);
          params[split[i].slice(1, split[i].length)] = urlsplit[i];
        }
        else if (split[i] !== urlsplit[i]) {
          // not ok
          match = false;
          break;
        }
        else {
          _browser_url.push(split[i]);
        }
      }

      if (match) {
        output.path = mapping.path;
        output.request_url = clearHash(join(this.browser_url || "", typeof mapping.realpath === "function" ? mapping.realpath(mapping.path, params) : mapping.realpath), this.trailingslash);
        output.params = params;
        output.browser_url = format(join(..._browser_url), this.trailingslash);
        break;
      }
    }

    this.mappedURL = output;
  }
  private async gethtml() {
    if (this.child) return;

    if (!this.dom) return;
    if (!this.head) return;
    if (!this.body) return;

    if (!this.mappedURL) return;

    if (!this.mappedURL.path || this.mappedURL.path === "/") {
      this.cleanup();
      return;
    }

    const { response, content } = await this.fetch(this.mappedURL.request_url);

    if (!(content && response)) {
      console.error({ response, content })
      throw new Error("fetching html content went wrong");
    }

    const contenttype = response.headers.get('content-type');

    if (contenttype !== "text/html") {
      throw new Error("fetched something besides html..");
    }

    const dom = this.parser.parseFromString(content, "text/html");

    // first remove any elements that are defined by omitters 
    for (let omiter of this.omitters) {
      const elements = dom.querySelectorAll(omiter);
      elements.forEach(element => {
        element.parentNode?.removeChild(element);
      });
    }

    const scripts = dom.querySelectorAll("script");
    const links = dom.querySelectorAll<HTMLLinkElement>('link[rel="stylesheet"]');
    const styles = dom.querySelectorAll("style");

    const list: Array<{ elm: PrepareElement, type: PrepareElementType }> = [];
    scripts.forEach(elm => list.push({ elm, type: "script" }));
    links.forEach(elm => list.push({ elm, type: "style" }));
    styles.forEach(elm => list.push({ elm, type: "style" }));

    // iterate sources 
    for (const item of list) {
      await this.handlesource(item.elm, item.type);

      // since we add the body we dont want the sources
      item.elm.parentNode?.removeChild(item.elm);
    }

    // cleanup existing sources (that was not just added)
    for (let i = 0; i < this.head.children.length; i++) {
      const child = this.head.children[i];
      const hash = child.getAttribute("data-hash") || "";

      if (!this.sources.has(hash)) {
        child.parentNode?.removeChild(child);
        i--;
      }
    }

    this.sources.clear();

    const body = dom.querySelector("body");
    const headstuff = dom.querySelectorAll("head > *:not(title)");
    if (headstuff) {
      if (this.updatetitle) {
        const title = dom.querySelector("title");
        if (title) {
          const domtitle = document.querySelector("title");
          if (domtitle) domtitle.innerHTML = title.innerHTML;
        }
      }
    }

    if (body) this.body.innerHTML = body.innerHTML;

    if (window.onload instanceof Function) {
      window.onload(new Event("load"));
    }
  }
  private async fetch(url: string) {
    if (this.cache) {
      const item = window.localStorage.getItem(url);
      if (item) {
        const { type, content } = JSON.parse(item);
        return {
          content, response: {
            ok: true, headers: {
              get: (key: string) => {
                return type;
              }
            }
          } as Response
        };
      }
    }

    const controller = new AbortController();
    let response, content;

    try {
      response = await fetch(url, { signal: controller.signal, });
      this.abortcontrollers.add(controller);

      if (response.ok) {
        content = await response.text();
      }
      else {
        console.error('[router] fetching went wrong, status not 2xx', response.status, response.statusText);
      }
    }
    catch (e) {
      console.error('[router] fetching went wrong', e);
    }
    finally {
      this.abortcontrollers.delete(controller);
      if (this.cache && content && response && response.ok) {
        window.localStorage.setItem(url, JSON.stringify({
          content,
          type: response.headers.get('content-type')
        }));
      }
      return { content, response };
    }
  }
  private async handlesource(element: PrepareElement, type: PrepareElementType) {
    let content = element.textContent;
    const url = element.getAttribute(type === "script" ? "src" : "href");

    if (url) {
      const data = await this.fetch(format(join(this.mappedURL.request_url, url)));
      if (data.content) {
        content = data.content;
      }
    }

    if (!content) {
      console.error("[router] content could not be loaded", element);
      return;
    }

    content = correct(this.dom.id, content, type);

    const h = await hash(content, this.encoder);
    this.sources.add(h); // append to latest sources 

    if (!this.head.querySelector(`[data-hash="${h}"]`)) {
      // no hash found 
      const child = document.createElement(type);
      child.textContent = content;
      child.setAttribute("data-hash", h);
      child.setAttribute("key", h);

      for (let attribute of element.attributes) {
        if (!["src", "href", "rel"].includes(attribute.name)) {
          child.setAttribute(attribute.name, attribute.value);
        }
      }

      this.head.appendChild(child);
    }
  }
}

// helper functions 
async function hash(content: string, encoder: TextEncoder) {
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}
/**
 * NOTE:: IF ERROR OCCURS ITS PROBABLY HERE
 * Corrects the source content by replacing all references to "body" to the id of dom instead 
 * @param domid {string} - ID of current router dom 
 * @param content {string} - content of source 
 */
function correct(domid: string, content: string, type: PrepareElementType) {
  if (type === "style") {
    // replace with a look-behind & look-ahead to ensure we dont remove any necessary info (CSS info)
    return content.replaceAll(/(?<=\W|^)body(?=\W|$)/g, `div[id='${domid}'] > div.router-body`);
  }

  // Replace querySelector and querySelectorAll calls (and getElementsByTagName)
  content = content.replaceAll(/([querySelector(All)?|getElementsByTagName]\([^)]*)\bbody\b(?![-_\w])/g, `\$1div[id='${domid}'] > div.router-body`)

  // Replace references to document.body
  content = content.replaceAll(/document\.body(\.\s)/g, `document.querySelector('div[id='${domid}'] > div.router-body')\$1`);

  return content;
}