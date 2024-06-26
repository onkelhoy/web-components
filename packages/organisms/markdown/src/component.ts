// system
import { html, property } from "@pap-it/system-utils";

// molecules
import "@pap-it/codeblock/wc";
import { Codeblock } from "@pap-it/codeblock";

// templates
import { Asset } from "@pap-it/templates-asset";

import { style } from './style';
import { Blockinfo } from "./types";

export class Markdown extends Asset {
  static style = style;

  private content: string = "";
  private codeblocks: string[] = [];

  // class functions
  constructor() {
    super({
      reactiveRendering: false,
    });

    // this.render_mode = "greedy";
    this.assetBase = "/public/markdown"
  }

  protected override async handleResponse(response: Response) {
    const content = await response.text();
    this.markdown(content);
  }

  // private functions
  private markdown(content: string) {
    const lines = content.split('\n');
    let htmlcontent: string[] = [];

    let insideelement: string | null = null;
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const isblock = this.block(lines, i);
      if (isblock) {
        if (insideelement) {
          htmlcontent.push(`</${insideelement}>`);
          insideelement = null;
        }

        htmlcontent = htmlcontent.concat(isblock[0])
        i = isblock[1];
        continue;
      }

      if (line.startsWith(">")) {
        if (insideelement === "p") {
          htmlcontent.push("</p>");
          insideelement = null
        }
        else if (insideelement === null) {
          htmlcontent.push('<div class="blockquote">');
          insideelement = "div"
        }

        line = line.slice(1).trim();
      }
      else if (line !== "" && insideelement === null) {
        htmlcontent.push("<p>");
        insideelement = "p";
      }

      if (line === "") {
        if (insideelement) {
          htmlcontent.push(`</${insideelement}>`);
          insideelement = null;
        }
      }
      else {
        htmlcontent.push(this.generalLine(line) + " ");
      }
    }

    if (this.shadowRoot) {
      this.content = htmlcontent.join("");
      // this.callAfterRender.push(this.updateCodeBlocks);
      this.requestUpdate();
    }
  }

  private updateCodeBlocks() {
    if (this.shadowRoot) {
      const blocks = this.shadowRoot.querySelectorAll<Codeblock>('pap-codeblock');
      blocks.forEach((elm, index) => elm.format(this.codeblocks[index]));
    }
  }

  private block(lines: string[], i: number): Blockinfo {
    let htmlcontent: string[] = [];

    // code
    if (lines[i].startsWith('```')) {
      if (lines[i].length > 3 && lines[i].endsWith('```')) {
        this.codeblocks.push(lines[i].split('```')[1])
        // htmlcontent.push(`<pap-codeblock>${lines[i].split('```')[1]}</pap-codeblock>`);
        htmlcontent.push("<pap-codeblock theme-toggle='false'></pap-codeblock>")
      }
      else {
        let curr = i + 1;
        const lang = lines[i].split('```')[1].trim();
        const code: string[] = [];
        while (!lines[curr].startsWith('```')) {
          code.push(lines[curr]);
          curr++;
        }
        this.codeblocks.push(code.join('\n'))
        htmlcontent.push(`<pap-codeblock theme-toggle='false' lang="${lang}"></pap-codeblock>`)
        // htmlcontent.push("")
        i = curr + 1;
      }

      return [htmlcontent, i];
    }

    // table
    if (lines[i].startsWith("|")) {
      const hcols = lines[i].split("|").filter(l => l !== "").map(l => `<th>${this.generalLine(l).trim()}</th>`);
      htmlcontent.push(`<table cellspacing="0" cellpadding="5"><thead><tr>${hcols.join('')}</tr></thead><tbody>`);
      let curr = i + 2; // we skip the position info..
      while (lines[curr].startsWith('|')) {
        const cols = lines[curr].split("|").filter(l => l !== "").map(l => `<td>${this.generalLine(l).trim()}</td>`);
        htmlcontent.push(`<tr>${cols.join('')}</tr>`);
        curr++;
      }
      htmlcontent.push('</tbody></table>');
      i = curr - 1;

      return [htmlcontent, i];
    }

    const headingMatch = lines[i].match(/^(#*)\s(\w*)/);
    if (headingMatch) {
      const [_whole, headings, text] = headingMatch;
      const l = headings.length;
      htmlcontent.push(`<h${l}>${this.generalLine(text)}</h${l}>`)

      return [htmlcontent, i];
    }

    const listMatch = lines[i].match(/^(-|\d\.)\s/);
    if (listMatch) {
      if (listMatch[1] === '-') htmlcontent.push("<ul>");
      else htmlcontent.push("<ol>");
      let curr = i;

      let itemMatch;
      while ((itemMatch = lines[curr].match(/^(-|\d*\.)\s/))) {
        htmlcontent.push(`<li>${this.generalLine(lines[curr].slice(itemMatch[1].length + 1))}</li>`);
        curr++;
      }
      if (listMatch[1] === '-') htmlcontent.push("</ul>");
      else htmlcontent.push("</ol>");

      i = curr - 1;

      return [htmlcontent, i];
    }

    return null;
  }

  private generalLine(line: string) {
    let text = line;
    const linkMatch = line.match(/\[(\w*)\]\(([\w:\/\.]*)\)/g)
    if (linkMatch) {
      for (let linksstring of linkMatch) {
        const match = line.match(/\[(\w*)\]\(([\w:\/\.]*)\)/)
        if (match) {
          const [_whole, linktext, href] = match;
          text = line.replace(linksstring, `<a href="${href}">${linktext}</a>`)
        }
      }
    }
    const codeMatch = line.match(/[^`]`([^`]+)`/g);
    if (codeMatch) {
      for (let codestring of codeMatch) {
        const content = codestring
          .replace(/\`/g, "")
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;');

        text = line.replace(codestring, `<code>${content}</code>`)
      }
    }

    return text;
  }

  render() {
    return this.content;
  }
}