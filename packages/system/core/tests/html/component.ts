import { html, CustomElement, property, query, bind, debounce, } from "@papit/core";


const arr = ["henry", "simon", "layhe", "julian", "rick", "bubbles"];
class Component extends CustomElement {
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
  })
  private count = 0;

  @property({
    rerender: true,
  })
  private name = "henry";

  @bind
  private handleshow() {
    this.show = true;
  }

  @bind
  private handlehide() {
    this.show = false;
  }

  @bind
  private handleinc() {
    this.count++;
  }

  @bind
  private handledec() {
    this.count--;
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
    const countButtons = html`
      <h3>count: ${this.count}</h3>
      <button onclick=${this.handleinc}>inc</button>
      <button onclick=${this.handledec}>dec</button>
    `

    return countButtons;
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

  render() {
    return this.renderListAdvanced();
  }
}

window.customElements.define("core-html", Component);