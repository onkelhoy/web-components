// import statements 
// system 
import { CustomElement, html, query, property } from "@papit/core";

// atoms 
import "@papit/typography";
import { Typography } from "@papit/typography";
import "@papit/button";
import "@papit/icon";
import "@papit/switch";

// local 
import { style } from "./style";
import { Display } from "./types";

const MAX_ATTRIBUTES = 2;
const MAX_HTMLCONTENT = 80;

const OPEN_BRACKETS = ["(", "[", "{"];
const CLOSE_BRACKETS = [")", "]", "}"];

export class Codeblock extends CustomElement {
  static style = style;

  @query({
    selector: 'main', load: function (this: Codeblock) {
      if (this.value)
      {
        this.format(this.value);
      }
    }
  }) main!: HTMLElement;
  @query<Typography>('#language') languageElement!: Typography;
  @query<Typography>('header > pap-button > pap-typography') copytext!: Typography;
  @query('fieldset') fieldsetElement!: HTMLFieldSetElement;

  @property display: Display = "code";
  @property direction: "row" | "column" = "column";
  @property color: "canvas" | "background" | "checker" = "checker";
  @property({ type: Boolean, attribute: "theme-toggle" }) themetoggle: boolean = true;
  @property({
    rerender: false,
    after: function (this: Codeblock, value: string) {
      this.setLanguage(value);
    }
  }) lang!: string;

  private value: string = "";
  private timer: NodeJS.Timeout | null = null;
  private _indentationLevel = 0;
  private set indentationLevel(value: number) {
    this._indentationLevel = Math.max(0, value);
  }
  private get indentationLevel() {
    return this._indentationLevel;
  }
  private stack: string[] = [];
  public language: string = "text";

  // event handlers
  private handlecopy = () => {
    navigator.clipboard.writeText(this.value).then(() => {
      console.log(`Copied to clipboard`);
      if (this.timer !== null) clearTimeout(this.timer);

      this.classList.add('copied');
      this.copytext.innerHTML = "Copied!";
      this.timer = setTimeout(() => {
        this.classList.remove('copied');
        this.copytext.innerHTML = "Copy code";
      }, 2000);
    }, (err) => {
      console.error('Failed to copy text: ', err);
    });
  }
  private handletogglechange = (e: Event) => {
    const isdark = (e.target as HTMLInputElement).checked;
    if (isdark)
    {
      this.classList.remove("theme-light");
      this.classList.add("theme-dark");
    }
    else
    {
      this.classList.add("theme-light");
      this.classList.remove("theme-dark");
    }
  }
  private handleslotchange = (e: Event) => {
    if (e.target instanceof HTMLSlotElement)
    {
      if (this.value) return;

      const original: string[] = [];
      const nodes = e.target.assignedNodes();
      for (const node of nodes)
      {
        if (node.nodeType === Node.TEXT_NODE)
        {
          if (node.textContent && node.textContent.trim() !== "") original.push(node.textContent);
        }
        else
        {
          if ('originalHTML' in node)
          {
            original.push(node.originalHTML as string);
          }
          else
          {
            original.push((node as HTMLElement).outerHTML);
          }
        }
      }

      // maybe not have breakline? 
      this.format(original.join('\n'));
    }
  }

  // public functions
  public FormatLine(line: string, preoutput: string = ""): string | null {
    const htmlformat = this.formatHTML(line, preoutput);

    if (htmlformat !== null)
    {
      if (!htmlformat) return null;
      return htmlformat;
    }
    return this.formatCODE(line, preoutput);
  }
  public format(value: string) {
    this.value = value;
    if (!this.main) return;

    const lines = this.value.split('\n');

    for (let i = 0; i < lines.length; i++)
    {
      const line = lines[i];
      let trimmedline = line.trim();

      // NOTE quickfix needs propper handle for general cases
      if (trimmedline === "<br>")
      {
        let output = '<span class="html-tag">&lt;</span><span class="html-tag-name">br </span><span class="html-tag">/&gt;</span>';
        this.appendLine(output);
        continue;
      }

      if (trimmedline === "")
      {
        if (i === 0 || i === lines.length - 1)
        {
          continue
        }
      }

      const output = this.FormatLine(trimmedline);
      if (output !== null)
      {
        this.appendLine(output);
      }
    }
  }

  // private functions
  /**
   * 
   * @param line string - the current line
   * @returns string|null - in case line should be combined with other lines if existing
   */
  private formatCODE(line: string, preoutput: string) {
    let output = line;

    const keywords = "\\b(def|print|async|await|this|export|switch|if|else|for|while|case|break|return|let|const|var|continue)\\b";
    const stringPattern = "([\"'])(?:\\\\.|[^\\\\])*?\\1";
    const functionPattern = "\\b(function)\\s+([a-zA-Z_$][0-9a-zA-Z_$]*)?\\s*\\(([^)]*)\\)";
    const classPattern = "\\b(class)\\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\\s*(extends\\s+([a-zA-Z_$][0-9a-zA-Z_$]*))?\\s*(implements\\s+([a-zA-Z_$][0-9a-zA-Z_$]*))?";

    const regex = new RegExp(`${stringPattern}|${functionPattern}|${classPattern}|${keywords}`, 'g');

    output = output.replace(regex, (match, s1, f1, f2, f3, c1, c2, c3, c4, c5, c6) => {
      if (s1)
      {
        // This is a string match
        return `<span class="string">${match}</span>`;
      }
      if (f1)
      {
        if (this.lang !== "html") this.setLanguage("javascript");

        // This is a function match
        const functionName = f2 ? `<span class="function-name">${f2}</span>` : '';
        let functionArgs = '';
        if (f3)
        {
          functionArgs = f3.split(',').map((arg: string) => `<span class="function-arg">${arg.trim()}</span>`).join(', ');
        }
        return `<span class="keyword function">function</span> ${functionName}(<span class="function-args">${functionArgs}</span>)`;
      }
      if (c1)
      {
        if (this.lang !== "html") this.setLanguage("javascript");

        // This is a class match
        const className = `<span class="class-name">${c2}</span>`;
        const extendsClass = c3 ? `<span class="keyword extends"> extends</span> <span class="extends-class">${c4}</span>` : '';
        const implementsClass = c5 ? `<span class="keyword implements"> implements</span> <span class="implements-class">${c6}</span>` : '';
        return `<span class="keyword class">class</span> ${className}${extendsClass}${implementsClass}`;
      }
      if (this.lang !== "html") this.setLanguage("javascript");

      // This is a keyword match
      return `<span class="keyword ${match}">${match}</span>`;
    });


    // Check for opening brackets at the end of the line
    let modifiedindentionlevel = 0;
    for (const openBracket of OPEN_BRACKETS)
    {
      if (output.endsWith(openBracket))
      {
        this.stack.push(openBracket);
        modifiedindentionlevel++; // should be applied afterward
      }
    }

    // Check for closing brackets at the start of the line
    const closeBracketMatches = output.match(new RegExp(`^(${CLOSE_BRACKETS.map(s => "\\" + s).join('|')})+`));
    if (closeBracketMatches)
    {
      const numOfCLOSE_BRACKETS = closeBracketMatches[0].length;
      for (let j = 0; j < numOfCLOSE_BRACKETS; j++)
      {
        if (this.stack.length > 0)
        {
          this.stack.pop();
          this.indentationLevel = Math.max(0, this.indentationLevel - 1);
        }
      }
    }

    if (modifiedindentionlevel === 0)
    {
      return preoutput + output;
    }
    else
    {
      this.appendLine(preoutput + output);
      this.indentationLevel += modifiedindentionlevel;
      return null;
    }
  }
  /**
   * 
   * @param line string - the current line
   * @returns string|null - in case line should be combined with other lines if existing
   */
  private formatHTML(line: string, preoutput: string): null | string {
    const tagpattern = /([^<]*)(<[^>]*>?)/;
    const tagmatch = line.match(tagpattern);

    // there's no html in this line! 
    if (!tagmatch) return null;

    // create the individual groups !
    let L = tagmatch[1] || null;
    const htmlpart = tagmatch[2];
    const cases = ["< ", "<="];
    if (cases.some(cs => htmlpart.startsWith(cs) || htmlpart.startsWith(cs.replace("<", ">"))))
    {
      return null
    }

    const R = line.split(tagmatch[0])[1];

    if (["javascript", "jsx"].includes(this.language))
    {
      this.setLanguage("jsx");
    }
    else this.setLanguage("html");


    const ismultiline = line.length > MAX_HTMLCONTENT;

    let outputline: string | null = preoutput;
    if (L)
    {
      // if we currently inside script or style we should apply format on it ! 
      if (["script", "style"].includes(this.peek()))
      {
        // it would never be HTML anyways..
        const leftcontent = this.formatCODE(L, preoutput);
        if (leftcontent) L = leftcontent;
      }

      // we just append it to the current output line (inline html)
      outputline += L;

      // if overflow we should add as its own line (as long the format returned - if not it already inserted!)
      if (ismultiline && outputline)
      {
        this.appendLine(outputline);
        outputline = "";
      }
    }

    // now we cover the html part "<TAG attr*>?" is the pattern 
    const htmloutput = this.formatHtmlTag(htmlpart, ismultiline, R);
    if (htmloutput)
    {
      if (outputline) outputline += htmloutput;
      else outputline = htmloutput;
    }

    // weird case that should not really happen
    if (ismultiline && outputline)
    {
      console.warn("[codeblock] multiline but we see content!");
      this.appendLine(outputline);
      outputline = "";
    }

    // now we reach the right side, this could have content and further ending tags etc etc (or normal code for some reason)
    if (R)
    {
      const output = this.FormatLine(R, preoutput);
      if (output)
      {
        if (ismultiline)
        {
          this.appendLine(output);
        }
        else
        {
          outputline += output;
        }
      }
    }

    return outputline;
  }

  // helper functions 
  private formatHtmlTag(line: string, multiline: boolean = false, right: string | null): null | string {
    // first we check if this is a ending tag 
    const endingmatch = line.match(/<\/([\w-]+)>/);

    if (endingmatch)
    {
      const tagname = endingmatch[1];
      // check if we see the tagname on the current stack -> this means we need to lower the indention level
      if (this.peek() === tagname)
      {
        this.stack.pop();
        this.indentationLevel--;
      }
      const ending = `<span class="html-tag">&lt;/</span><span class="html-tag-name">${tagname}</span><span class="html-tag">&gt;</span>`;
      if (multiline)
      {
        this.appendLine(ending);
      }
      else
      {
        return ending;
      }
    }

    // its a beginning tag so we should expect attributes ! 
    let tagmatch = line.match(/<([\w-]+)([^>]*)/);
    if (!tagmatch)
    {
      // this should not really happen! 
      console.log('mamma mia!', line)
      console.error("[codeblock] html but no html error");
      return null;
    }
    const tagname = tagmatch[1];
    const attributesString = tagmatch[2] ? tagmatch[2].trim() : "";
    const attributesRegex = /([\w-]+)(?:=(".*?"|'.*?'|\S+))?/g;
    let match;
    let attributes = [];
    let attributesize = 0;

    while ((match = attributesRegex.exec(attributesString)) !== null)
    {
      attributes.push(match);
      attributesize += match[0].length;
    }

    // const attributes = tagmatch[2] ? tagmatch[2].trim().split(/\s/) : [];
    const multilines = multiline || attributes.length > MAX_ATTRIBUTES;

    let output = `<span class="html-tag">&lt;</span><span class="html-tag-name">${tagname}</span>`;

    // check if we need to split the opening html tag into multilines
    if (multilines)
    {
      this.stack.push(tagname);
      this.appendLine(output);
      output = "";
      // we want our attributes to be indeted
      this.indentationLevel++;
    }
    // loop the attributes
    for (let [_full, name, value] of attributes)
    {
      // split by the "=" if exists 
      // const  = attribute;
      // so if attributes are added as new lines we need not to add a margin-left
      let attributeinlineindent = multilines ? "indent" : "";
      let attributestring = `<span class="html-attribute ${attributeinlineindent}"><span class="html-attribute-name">${name}</span>`;
      if (value && value !== '""')
      {
        // yes value exists 
        attributestring += `=<span class="html-attribute-value">${value}</span>`
      }
      // adding the end (as we might not have value always this is why we do it later)
      attributestring += "</span>"

      // self explained
      if (multilines)
      {
        this.appendLine(attributestring);
      }
      else
      {
        output += attributestring;
      }
    }

    // if we see the tag has a ending we want to append to output (or add new line in case multilines)
    if (!line.endsWith("/>") && line.endsWith(">"))
    {
      const ending = '<span class="html-tag">&gt;</span>';
      if (multilines)
      {
        // decrese for ending but increase for content
        this.indentationLevel--;
        this.appendLine(ending);
        this.indentationLevel++;
        return null;
      }
      else
      {
        if (multilines || !right)
        {
          this.stack.push(tagname);
          this.appendLine(output + ending);
          this.indentationLevel++;
          return null;
        }
        output += ending;
      }
    }

    return output;
  }
  private appendLine(value: string) {
    if (this.main)
    {
      const divline = document.createElement("div");
      divline.className = "line";
      divline.style.paddingLeft = `calc(${this.indentationLevel} * var(--padding-large, 16px))`;
      divline.innerHTML = value;
      this.main.appendChild(divline);
    }
  }
  private setLanguage(lang: string) {
    if (lang === this.language) return;
    if (this.lang && lang !== this.lang) return;

    this.language = lang;
    if (this.languageElement)
    {
      this.languageElement.innerHTML = this.language;
    }
  }
  private peek() {
    return this.stack[this.stack.length - 1];
  }

  render() {
    return html`
      <fieldset part="fieldset">
        <legend>
          <pap-typography>result</pap-typography>
        </legend>
        <slot @slotchange="${this.handleslotchange}"></slot>
      </fieldset>
      <code part="code">
        <div radius="small">
          <header>
            <pap-typography id="language">${this.language}</pap-typography>
            ${this.themetoggle ? html`
              <pap-switch 
                color="primary"
                @change="${this.handletogglechange}" 
                checked="${(window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches)}"
              >
              </pap-switch>
            ` : html`<span />`}
            <pap-button 
              variant="clear"  
              color="secondary"
              radius="none" 
              mode="hug"
              @click="${this.handlecopy}" 
            >
              <pap-icon cache name="done" slot="prefix"></pap-icon>
              <pap-icon cache name="content_paste" slot="prefix"></pap-icon>
              <pap-typography>Copy code</pap-typography>
            </pap-button>
          </header>
        <main></main>
      </div>
    </code>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pap-codeblock": Codeblock;
  }
}