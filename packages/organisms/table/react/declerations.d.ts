
declare namespace JSX {
  interface IntrinsicElements {
  	'pap-table': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/component.js').Table> & import('./Table').Attributes, HTMLElement>;
		'pap-table-menu': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-menu/index.js').TableMenu> & import('./TableMenu').TableMenuAttributes, HTMLElement>;
		'pap-table-sheets': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-sheets/index.js').TableSheets> & import('./TableSheets').TableSheetsAttributes, HTMLElement>;
		'pap-table-column': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-column/index.js').Column> & import('./Column').ColumnAttributes, HTMLElement>;
		'pap-table-filter-individual': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-filter-individual/index.js').TableFilterIndividual> & import('./TableFilterIndividual').TableFilterIndividualAttributes, HTMLElement>;
		'pap-table-action-menu': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-action-menu/index.js').TableActionMenu> & import('./TableActionMenu').TableActionMenuAttributes, HTMLElement>;
		'pap-table-filter': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-filter/index.js').TableFilter> & import('./TableFilter').TableFilterAttributes, HTMLElement>;
		'pap-table-manage': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-manage/index.js').TableManage> & import('./TableManage').TableManageAttributes, HTMLElement>;
		'pap-table-header': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-header/index.js').TableHeader> & import('./TableHeader').TableHeaderAttributes, HTMLElement>;
		'pap-table-form-menu': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-form-menu/index.js').TableFormMenu> & import('./TableFormMenu').TableFormMenuAttributes, HTMLElement>;
		'pap-table-cell': React.DetailedHTMLProps<React.HTMLAttributes<import('../src/components/table-cell/index.js').Cell> & import('./Cell').CellAttributes, HTMLElement>;
  }
}
