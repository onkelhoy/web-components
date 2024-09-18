const fs = require("node:fs");
const path = require("node:path");

const {playwright_extractor} = require('./util/extractor/playwright');
const {ts_extractor} = require('./util/extractor/typescript');
const {html_extractor} = require('./util/extractor/html');
// const { decorator_extractor, event_extractor } = require('./util/extractor/types');
// const { extract_import } = require('./util/extractor/import');
const {css_extractor} = require('./util/extractor/css');
const {class_extractor, CLASSINFO} = require('./util/extractor/class');

// helper
const {
  getCustomElement,
  getLocalModule,
  iterator,
  IMPORTS
} = require('./util/helper/bundle');

// PROCESS ARGS
const CLASSNAME = process.argv[2];
const COMPONENT_PATH = process.argv[3];
const COMPONENT_FOLDER_PATH = process.argv[4];
const LEVEL = process.argv[5];
const PACKAGE_DIR = process.argv[6];
const MAINCLASSNAME = process.argv[7];
const ATOMICTYPE = process.argv[8];

// VARIABLES
const MAINCLASSINFO_NAME = `${ATOMICTYPE}-${MAINCLASSNAME}`;
const CLASSINFO_NAME = `${ATOMICTYPE}-${CLASSNAME}`;
// const IMPORTS = {};

// global
async function extractor(package_path, className) {
  // we need to find filepath
  const classinfo = class_extractor(package_path, className);
  if (!classinfo) {
    throw new Error('could not find class: ' + className);
  }

  const customelement = await getCustomElement(classinfo);
  if (customelement) {
    return customelement;
  }

  // this is going to iterate dist and src file to extract info which it also returns 
  const iteration_info = iterator(classinfo);

  let extend_class = null;
  if (classinfo.extend && !["HTMLElement", "Base"].includes(classinfo.extend)) {

    for (let imp of iteration_info.imports) {
      if (imp.name === classinfo.extend) {
        const super_path = getLocalModule(imp.from);

        if (super_path) {
          extend_class = await extractor(super_path, imp.name);
        }
      }
    }

    if (!extend_class) {
      const extendpackagename = `${classinfo.atomic_type}-${classinfo.extend}`;
      if (CLASSINFO[extendpackagename] && CLASSINFO[extendpackagename].package === classinfo.package) {
        extend_class = await extractor(classinfo.package, classinfo.extend);
      }
    }
  }

  const ts_properties = ts_extractor(classinfo.path, classinfo.name);
  const properties = ts_properties
    .filter(info => iteration_info.decorators.property[info.name]);

  return {
    ...iteration_info,
    folder: classinfo.folder,
    className: classinfo.name,
    properties,
    extend_class
  };
}

async function runner() {
  const playwrightinfo = await playwright_extractor(CLASSNAME, MAINCLASSINFO_NAME);
  const htmlinfo = html_extractor(playwrightinfo.html);
  htmlinfo.tagName = playwrightinfo.tagName.toLowerCase();

  let typeinfo;
  if (CLASSINFO[CLASSINFO_NAME] && CLASSINFO[CLASSINFO_NAME].typeinfo) {
    typeinfo = CLASSINFO[CLASSINFO_NAME].typeinfo;
  }
  else {
    typeinfo = await extractor(PACKAGE_DIR, CLASSNAME);
    if (!CLASSINFO[CLASSINFO_NAME]) {
      if (process.env.VERBOSE) console.log('[ANALYSE] 🟨 warning - extractor has run but no classinfo generated')
      CLASSINFO[CLASSINFO_NAME] = {};
    }

    let allproperties = [...typeinfo.properties]
    let allevents = [...typeinfo.events];

    const allproperties_map = new Set();
    const allevents_map = new Set();

    allproperties.forEach(p => allproperties_map.add(p.name));
    allevents.forEach(e => allevents_map.add(e.name));

    let extend = typeinfo.extend_class;
    while (extend) {
      extend.properties.forEach(p => {
        if (!allproperties_map.has(p.name)) {
          allproperties_map.add(p.name);
          allproperties.push(p);
        }
        else if (process.env.VERBOSE) console.log('[ANALYSE] 🟨 warning - dublicate property found, ignoring', p);
      });
      extend.events.forEach(e => {
        if (!allevents_map.has(e.name)) {
          allevents_map.add(e.name);
          allevents.push(e);
        }
        else if (process.env.VERBOSE) console.log('[ANALYSE] 🟨 warning - dublicate event found, ignoring', e);
      });
      extend = extend.extend_class;
    }

    allproperties = allproperties.map(a => {
      return {
        ...playwrightinfo.properties[a.name],
        ...a,
      }
    })

    CLASSINFO[CLASSINFO_NAME].info = {
      ...typeinfo,
      imports: IMPORTS,
      dist_filepath: CLASSINFO[CLASSINFO_NAME].dist,
      html: htmlinfo,
      allproperties,
      allevents,
      // css: cssinfo,
      // _properties: playwrightinfo.properties, // TODO need to fix issue with 
    }

    // lets also save the classinfo
    fs.writeFileSync(path.join(process.env.SCRIPTDIR, '.temp', 'classinfo.json'), JSON.stringify(CLASSINFO), 'utf-8');
  }


  // .map(prop => {
  //   console.log('prop', prop)
  //   return prop;
  // })

  // const cssinfo = css_extractor(PACKAGE_DIR, IMPORTS, getLocalModule)

  // write it to file
  // fs.writeFileSync(OUTPUT, JSON.stringify(info, null, 2), "utf-8"); // NOTE pretty-print
  const output_path = path.join(process.env.SCRIPTDIR, '.temp', MAINCLASSINFO_NAME, `output/${CLASSNAME}-${LEVEL}.json`);
  const output_content = JSON.stringify(CLASSINFO[CLASSINFO_NAME].info, null, 2);
  fs.writeFileSync(output_path, output_content, "utf-8");

  // process.exit();
}

runner();

