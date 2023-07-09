// utils 
import { html, property, query } from "@circular-tools/utils";

// molecules
import "@circular/pagination/wc";

// templates
import { BaseTemplate } from "@circular-templates/base";

// local 
import { style } from "./style";
import { Cell, Config, Data, HeaderCell } from './types';
import { Cell as CellElement } from "./components/cell";
import { CellTitle } from "./components/cell-title";

export class Table extends BaseTemplate {
    static style = style;

    @property({ type: Object, attribute: false }) config: Config = {};
    @property({ type: Array, attribute: false }) rows: Data[][] = [];

    @query('table') tableElement!: HTMLTableElement;

    // event handlers 
    private handlecellchange = (e:Event) => {
        if (e.target instanceof CellElement)
        {
            console.log('change', e.target.value);
        }
    }
    private handlesorting = (e:Event) => {
        if (e.target instanceof CellTitle)
        {
            this.tableElement
                .querySelectorAll<CellTitle>('o-cell-title')
                .forEach(element => {
                    if (element !== e.target)
                    {
                        if (element.canSort)
                        {
                            element.sorting = 'none'
                        }
                    }
                })

            console.log('sorting', e.target.id, e.target.sorting)
        }
    }

    // private functions 
    private getCell(col: Data) {
        const colascell = col as Cell;
        const isstring = typeof col === "string";
        if (isstring || !colascell.header)
        {
            const value = isstring ? col : colascell.value;
            const allowEdit = this.config.canEdit !== undefined ? this.config.canEdit : isstring ? false : !!colascell.canEdit; 

            return html`
                <td>
                    <o-cell @change="${this.handlecellchange}" value="${value}" allowEdit="${allowEdit}"></o-cell>
                </td>
            `
        }
        else
        {
            const colasheadercell = col as HeaderCell;
            let cansort = colasheadercell.sorting;
            if (cansort === undefined)
            {
                cansort = !!this.config.sorting;
            }

            return html`
                <th>
                    <o-cell-title id="${colasheadercell.value}" @sorting="${this.handlesorting}" canSort="${cansort}">${colasheadercell.value}</o-cell-title>
                </th>
            `
        }
    }
    private getRow = (row: Data[]) => {
        return html`
            <tr>
                ${row.map(data => this.getCell(data))}
            </tr>
        `
    }
    private getRows() {
        return this.rows.map(this.getRow);
    }

    render() {
        return html`
            <table cellspacing="0" cellpadding="0">
                ${this.getRows()}
            </table>
            <footer>
                ${this.config.pagination ? html`
                <o-pagination perpage="5" total="${this.config.pagination.size || this.rows.length}"></o-pagination> 
                ` : ''}
            </footer>
        `
    }
}


declare global {
    interface HTMLElementTagNameMap {
        "o-table": Table;
    }
}