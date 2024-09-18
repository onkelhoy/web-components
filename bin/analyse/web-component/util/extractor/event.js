function event_extractor(events, line, lines, i) {
  // NOTE we want to check for this, an element could also be triggered to dispatch (not going outside of shadowroot)
  // however, cases like this would break: (but 99.999999% would never happend especially due to linter)
  // this
  //    .dispatchEvent 

  if (!/this\.dispatchEvent\(/.test(line)) return false

  let correctedeventline = "";
  const parenthesises = {
    open: 0,
    close: 0
  };

  let k = i;
  while (k < lines.length) {
    const trimmed = lines[k].trim();
    correctedeventline += trimmed;

    const local_parenthesises = handleparanthesis(trimmed);
    parenthesises.open += local_parenthesises.open;
    parenthesises.close += local_parenthesises.close;

    if (parenthesises.open === parenthesises.close) {
      // self closing 
      break;
    }

    // still open
    k++;
  }

  if (parenthesises.open !== parenthesises.close) {
    console.log('[ANALYSE] ❌ error - event lines could not be determined')
    return k;
  }

  if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - event extraction will begin', correctedeventline);

  const match = correctedeventline.match(/\.dispatchEvent\(new (\w+)(<[^>]+>)?\(\W*([^"',)]+)\W,?\s?(.*)?/);

  if (match) {
    const eventtype = match[1]; // Event or CustomEvent 
    let customtype = match[2]; // custom typing 
    if (customtype) customtype = customtype.replace(/[<>]/g, '');
    const eventname = match[3];
    let eventdata = match[4];
    if (eventdata && /detail/.test(eventdata)) {
      const cases = eventdata.match(/(\w+:)+/g);
      eventdata = {
        object: eventdata.replace(/\)\);$/, ''),
        properties: cases.filter(v => v !== 'detail:').map(v => v.replace(':', '')), // NOTE for nested objects this WILL FAIL!!
      }
    }
    else {
      eventdata = undefined;
    }

    if (!events.some(e => e.name === eventname)) {
      events.push({ type: eventtype, custom: customtype, name: eventname, data: eventdata });
    }
  }

  return k;
}

function handleparanthesis(line) {
  const parenthesises = {
    open: 0,
    close: 0
  };
  const match = line.match(/[()]/g);
  if (!match) return parenthesises;

  for (let m of match) {
    if (m === "(") parenthesises.open++;
    if (m === ")") parenthesises.close++;
  }

  return parenthesises;
}

module.exports = {
  event_extractor
}