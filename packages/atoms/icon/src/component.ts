import { property, html, query, CustomElement } from '@papit/core';
import { Asset } from '@papit/asset';

import { style } from './style';
import { Container, CountryEmojiSet, Size } from './types';

export class Icon extends Asset {
  static style = style;

  private content: string = "";
  private flag?: string;

  @query({
    selector: 'svg',
    load: function (this: Icon, value) {
      this.setSVG();
    }
  }) svgElement!: SVGSVGElement;

  @property({ rerender: true }) container?: Container;
  @property({ rerender: true }) viewbox = "0 96 960 960";
  @property({
    after: function (this: Icon, value: string) {
      this.file = value + ".svg";
    }
  }) name?: string;
  @property({
    after: function (this: Icon) {
      if (this.color) this.style.color = this.color;
    }
  }) color?: string;
  @property({
    after: function (this: Icon) {
      this.style.removeProperty("--icon-custom-size");
    }
  }) size: Size = "medium";
  @property({
    attribute: "custom-size",
    type: Number,
    after: function (this: Icon) {
      if (this.customSize !== undefined) this.style.setProperty("--icon-custom-size", this.customSize + "px");
    }
  }) customSize?: number;
  @property({
    attribute: 'country-flag',
    after: function (this: Icon, value: string, old: string) {
      if (value !== old)
      {
        this.setFlag();
      }
    }
  }) countryFlag?: string;

  // class functions
  constructor() {
    super();
    this.assetBase = "/icons";
  }


  override async handleResponse(response: Response | string) {
    let content, viewbox = "0 96 960 960"; // default google icon's
    if (typeof response === "string")
    {
      content = response;
    }
    else
    {
      content = await response.text();
      const [parsed_content, parsed_viewbox] = this.extractSvgContent(content);

      if (parsed_viewbox) 
      {
        viewbox = parsed_viewbox;
      }
      if (parsed_content) 
      {
        content = `SVG:${viewbox}##${parsed_content.trim()}`;
        this.cacheData(this.file, content);
      }
    }

    if (content.startsWith("SVG:"))
    {
      this.setAttribute("data-hide-slot", "true");
      this.content = content;
      this.setSVG();
    }
    else
    {
      this.setAttribute("data-hide-slot", "false");
    }
  }
  override handleError(response: Response | null, error?: any) {
    this.setAttribute("data-hide-slot", "false");
  }

  // helper functions
  private extractSvgContent(svgString: string) {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgString, 'image/svg+xml');
    const svgElement = svgDoc.querySelector('svg');
    if (svgElement)
    {
      return [svgElement.innerHTML, svgElement.getAttribute("viewBox")];
    }
    return ["", ""];
  }
  private setSVG() {
    if (!this.svgElement) return;

    const parsed = /SVG:([^#]+)##/.exec(this.content);
    if (!parsed) return;

    const content = this.content.split(parsed[1])[1];
    this.viewbox = parsed[1];
    if (this.hasAttribute("show")) console.log(this.content, parsed, content, this.svgElement)
    this.svgElement.innerHTML = content;
  }
  private setFlag() {
    if (!this.countryFlag) return;

    let text = this.countryFlag;
    if (text.toLowerCase() === 'en') text = 'gb';

    let error = false;

    this.flag = text
      .toUpperCase()
      .split('')
      .map(v => {
        if (CountryEmojiSet[v]) return CountryEmojiSet[v];
        error = true;
        console.error('please provide valid country-region code: ' + this.countryFlag);
      })
      .join('');

    if (!error)
    {
      (this as CustomElement).requestUpdate?.();
    }
  }

  render() {
    return html`
      <slot part="fallback"></slot>
      <span part="flag">${this.flag}</span>
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="${this.viewbox}"
        part="svg"
      >
        ${this.content}
      </svg>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-icon": Icon;
  }
}