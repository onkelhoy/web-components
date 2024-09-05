const fs = require("node:fs");
const path = require("node:path");

function css_extractor(package_path, imports, getLocalModule) {
  const src = fs.readFileSync(path.join(package_path, 'src/component.ts'), 'utf-8');
  const lines = src.split('\n');
  let styles = [];

  // check first if it even imports and uses a style 
  for (let i = 0; i < lines.length; i++) {
    // TODO if this is multiline array then it would fail !!
    const style_match = lines[i].match(/static\sstyles?\s=\s\[?([^;\]]*)/);
    if (style_match) {
      styles = style_match[1].split(',');
      break;
    }
  }

  const sources = [];
  let variables = {};
  for (let style of styles) {
    const split = style.split('.');
    const name = split[0].trim();

    for (let imp of imports[package_path]) {
      if (imp.name === name) {
        if (imp.from.startsWith('@')) {
          const parentfolder = getLocalModule(imp.from);
          sources.push(css_extractor(parentfolder, imports, getLocalModule));
        }
        else {
          // should be local 
          let from = imp.from;
          if (!from.endsWith('.js')) {
            // from = from.slice(0, from.length - 3);
            from += ".js";
          }

          try {
            const css = fs.readFileSync(path.resolve(package_path, "dist/src", from), 'utf-8');
            variables = extract_cssvariables(css, package_path);
          }
          catch (e) {
            console.log('css error', e);
          }
        }
      }
    }
  }

  return {
    folder: package_path,
    sources,
    variables,
  }
}

function extract_cssvariables(css) {
  const lines = css.split('\n');
  const variables = {};

  const matches = [];
  const helper_map = {};

  function append(name) {
    if (!variables[name]) {
      variables[name] = {
        usecases: [],
        fallbacks: []
      };
    }

    if (!helper_map[name]) {
      helper_map[name] = {
        usecase: {},
        fallback: {}
      };
    }
  }

  // TODO extract variables
  for (let line of lines) {
    const var_match = line.match(/([^:]+):\s?(var\([^;]+);/);
    if (var_match) {
      matches.push(var_match);
    }
  }

  for (let match of matches) {
    // init all names of right hand side 
    const extracted_names = match[2].match(/(--[\w-]+)/g);
    if (extracted_names) {
      // append names
      extracted_names.forEach(append);
    }

    // if use case found (start with null)
    let usecase = null;

    // check if its a variable assign 
    if (match[1].startsWith('--')) {
      // append names
      append(match[1]);

      // NOTE this should maybe be value ?
      if (match[2]) {
        variables[match[1]].fallbacks.push(match[2]);
      }
    }
    // nope its a use case then 
    else {
      usecase = match[1].trim(); // use case found
    }

    // get all variable (of usage side)
    const extracted_variables = match[2].split(',');
    // console.log('extracted_variables', match[2], extracted_variables)
    extracted_variables.forEach((v, i) => {
      const name = v.match(/(--[\w-]+)/g);
      if (name) // will only be one
      {
        if (usecase && !helper_map[name[0]].usecase[usecase]) {
          helper_map[name[0]].usecase[usecase] = true;
          variables[name[0]].usecases.push(usecase)
        }

        const fallback = extracted_variables.slice(i + 1, extracted_variables.length).join(',');
        const value = fallback
          .slice(0, fallback.length - (i + 1))
          .trim();

        if (value && !helper_map[name[0]].fallback[value]) {
          helper_map[name[0]].fallback[value] = true;
          variables[name[0]].fallbacks.push(value);
        }
      }
    })
  }

  return variables;
}

module.exports = {
  css_extractor
}