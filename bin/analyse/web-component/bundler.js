const fs = require("node:fs");
const path = require("node:path");

const PACKAGE_DIR = process.argv[2];

const outputs = [];
let index = 3;
while (true) {
  if (process.argv[index]) {
    outputs.push(process.argv[index]);
    index++;
  }
  else {
    break;
  }
}

const finaloutput = {
  sub: {},
  main: null,
};

for (let output of outputs) {
  const filename = path.basename(output);
  const matched = filename.match(/(\w+)-(\w+).json/);
  if (!matched) {
    console.log('[ANALYSE:bundle] ❌ error - could not match the output file to determine name and level')
    process.exit(1);
  }

  const name = matched[1];
  const level = matched[2];

  const json = JSON.parse(fs.readFileSync(output));

  if (level === "sub") {
    if (finaloutput.sub[json.className]) {
      console.log('[ANALYSE:bundle] ❌ error - found 2 sub files with same classname', {name, level});
      process.exit(1);
    }
    finaloutput.sub[json.className] = json;
  }
  else {
    if (finaloutput.main !== null) {
      console.log('[ANALYSE:bundle] ❌ error - found 2 main files', {name, level});
      process.exit(1);
    }
    finaloutput.main = json;
  }
}

fs.writeFileSync(path.join(PACKAGE_DIR, 'custom-elements.json'), JSON.stringify(finaloutput, null, 2));