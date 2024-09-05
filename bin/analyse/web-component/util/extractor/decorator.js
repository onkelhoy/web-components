function decorator_extractor(info, line, lines, i) {
  if (/__decorate\(\[/.test(line)) {
    let type = null; // property, query or context now 

    while (i < lines.length) {
      i++;

      if (type === null) {
        const trimmed = lines[i].trim();
        if (trimmed.startsWith('property(')) {
          // extract further info like attribute etc 
          type = 'property';
        }
        if (trimmed.startsWith('context(')) {
          type = 'context';
        }
        if (trimmed.startsWith('query(')) {
          type = 'query';
        }

        if (type) {
          i++;
        }
      }

      const propmatch = lines[i].match(/\.prototype\,\s\"(\w+)/);
      if (propmatch) {
        if (type) info.decorators[type][propmatch[1]] = true;
        return i;
      }
    }
  }

  return i;
}

module.exports = {
  decorator_extractor
}