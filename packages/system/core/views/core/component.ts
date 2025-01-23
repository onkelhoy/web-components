import { CustomElement, html, bind, property, query } from "@papit/core";

const arr = ["henry", "simon", "layhe", "julian", "rick", "bubbles"];
export class Basic extends CustomElement {

  private nameindex = 0;

  @property({
    type: Boolean,
    rerender: true,

  })
  private show = false;


  @property({
    type: Number,
    rerender: true,
    attribute: "counter",
    after: function(this: Basic, value:number, old:number, initial: boolean, isAttribute) {
      if (isAttribute) this.arr = new Array(value).fill(0).map((_v, i) => i);
    }
  })
  private count = 0;

  @property({
    type: Array,
    rerender: true,
  })
  private arr:number[] = [];

  @property({
    rerender: true,
  })
  private name = "henry";

  @query<HTMLSpanElement>({
    load(this: Basic, elm) {
      // console.log('hej:', elm, this)
    },
    selector: "span"
  }) hej!: HTMLSpanElement;


  @query<HTMLSpanElement>({
    load(this: Basic, elm) {
      // console.log('ul is found:', elm, this)
    },
    selector: "ul"
  }) hejsan!: HTMLSpanElement;

  @bind
  private handleshow () {
    this.show = true;
  }

  @bind
  private handlehide() {
    this.show = false;
  }

  @bind
  private handleinc () {
    this.count++;
    this.arr.push(this.arr.length);
  }

  @bind
  private handledec() {
    this.count--;
    this.arr.pop();
  }

  @bind 
  private handlename() {
    this.nameindex++;
    this.name = arr[this.nameindex % arr.length];
  }

  renderShowButtons() {
    return html`
      <h3>show: ${String(this.show)}</h3>
      <button onclick=${this.handleshow}>show</button>
      <button onclick=${this.handlehide}>hide</button>
    `
  }
  renderCountButtons() {
    return html`
      <h3>count: ${this.count}</h3>
      <button onclick=${this.handleinc}>inc</button>
      <button onclick=${this.handledec}>dec</button>
    `
  }

  renderListAdvanced() {

    // const a = html`<a href="#bajs">im anchor</a>`
      // ${a}

    return html`
      <span>WOW</span>
      ${this.renderShowButtons()}
      ${this.renderCountButtons()}

      <h3>name: ${this.name}</h3>
      <button onclick=${this.handlename}>shuffle name</button>

      ${this.show && html`
        <h1>IM ${this.count}</h1>
        <ul>
          <li>Array with keys</li>
          ${new Array(Math.max(this.count, 0)).fill(0).map((_, i) => html`<li key=${i}>item: ${i} ${i === 5 ? html`<strong>FIVE ${this.name}</strong>` : null}</li>`)}
        </ul>

        <ul>
          <li>Array without keys</li>
          ${new Array(Math.max(this.count, 0)).fill(0).map((_, i) => html`
            <li>
              item: ${i} ${i === 5 ? html`<strong>FIVE ${this.name}</strong>` : null} 
              <ul>
                ${new Array(Math.max(this.count, 0)).fill(0).map((_, i) => html`<li>item: ${i}</li>`)}
              </ul>
            </li>
          `)}
        </ul>
      `}
    `;
  }


  renderListSimple() {

    return html`
      ${this.renderCountButtons()}

      <h3>name: ${this.name}</h3>
      <button onclick=${this.handlename}>shuffle name</button>

      <ul>
        ${new Array(Math.max(this.count, 0)).fill(0).map((_, i) => html`
          <li>
            item: ${i}
            <strong>FIVE ${this.name}</strong>
            <ul>${new Array(Math.max(this.count, 0)).fill(0).map((_, i) => html`<li key="heee${i}">item: ${i}</li>`)}</ul>  
          </li>
        `)}
      </ul>
    `;
  }

  renderListInternal() {

    return html`
      ${this.renderCountButtons()}

      <ul>
        ${this.arr.map(i => html`
          <li key="sss${i}">
            item ${i}
            <ul>${this.arr.map(i => html`<li key="heee${i}">item: ${i}</li>`)}</ul>  
          </li>
        `)}
      </ul>
    `;
  }

  renderConditional() {
    return html`
      ${this.renderShowButtons()}

      ${this.show && html`<strong>hello world</strong>`}

      ${this.show ? html`hello` : null}
    `
  }

  renderAttributeCase() {
    return html`
      ${this.renderShowButtons()}
      ${this.renderCountButtons()}

      <div 
        show=${this.show}
        count=${this.count}
        combined="show ${this.show} count ${this.count}"
      >
        <p>show=${this.show}</p>
        <p>count=${this.count}</p>
        <p>combined="show ${this.show} count ${this.count}"</p>
      </div>
    `
  }



  render() {
    return this.renderListInternal();
  }
}

// Register the element with the browser
const cElements = customElements ?? window?.customElements;

if (!cElements) {
  throw new Error('Custom Elements not supported');
}

if (!cElements.get('pap-core-basic')) {
  cElements.define('pap-core-basic', Basic);
}