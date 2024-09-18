function extract_import(line) {
  const import_match_module = line.match(/import\W+\{([^'"\}]+)\W+from\W+["']([^"']+)["']/);
  if (import_match_module) {
    const imports = [];
    const [_whole, names, from] = import_match_module;
    if (!checkimport(from)) return null;

    const namesplit = names.split(",");
    for (const name of namesplit) {
      if (name === "") continue;
      imports.push({
        name: name.trim(),
        from, // TODO this should be cleaned
      })
    }
    return imports;
  }
  const import_match_default = line.match(/import\W+(\w+)\W+from\W+["']([^"']+)["']/);
  if (import_match_default) {
    const imports = [];
    const [_whole, name, from] = import_match_default;
    if (!checkimport(from)) return null;

    imports.push({
      name: name.trim(),
      from, // TODO this should be cleaned
    })
    return imports;
  }

  return null;
}

// helper
function checkimport(from) {
  if (from.startsWith('@pap-it/system')) {
    return false;
  }
  if (!from.startsWith('@' + process.env.PROJECTSCOPE)) {
    // checking if its local
    if (!from.startsWith('.')) {
      return false;
    }
  }

  return true;
}

module.exports = {
  extract_import,
}