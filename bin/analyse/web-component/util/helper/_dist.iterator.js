const fs = require("node:fs");

const {extract_import} = require('../extractor/import');
const {decorator_extractor} = require('../extractor/decorator');

function iterator(classinfo, info) {
  const lines = fs.readFileSync(classinfo.dist, 'utf-8').split('\n');
  let imports = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // check for comments
    if (/\/\//.test(trimmed)) continue;
    if (/\/\*/.test(trimmed)) continue;
    if (/\*/.test(trimmed)) continue;

    let _imports = extract_import(trimmed);
    if (_imports) {
      imports = imports.concat(_imports);
      continue;
    }

    i = decorator_extractor(info, trimmed, lines, i);
  }

  info.imports = imports;
}

module.exports = {
  iterator,
}