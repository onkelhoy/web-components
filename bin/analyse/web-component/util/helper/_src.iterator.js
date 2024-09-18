const fs = require("node:fs");
const {event_extractor} = require('../extractor/event');

function iterator(classinfo, info) {
  const lines = fs.readFileSync(classinfo.path, 'utf-8').split('\n');
  const events = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    // check for comments
    if (/\/\//.test(trimmed)) continue;
    if (/\/\*/.test(trimmed)) continue;
    if (/\*/.test(trimmed)) continue;

    // ignore imports
    if (trimmed.startsWith('import')) continue;

    const ret = event_extractor(events, trimmed, lines, i);
    if (ret === "continue") {
      continue;
    }
    if (typeof ret === "number") {
      i = ret;
      continue;
    }
  }

  info.events = events;
}

module.exports = {
  iterator,
}
