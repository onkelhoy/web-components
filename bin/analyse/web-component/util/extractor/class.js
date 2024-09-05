const fs = require("node:fs");
const path = require("node:path");

let CLASSINFO = {};
const classinfo_path = path.join(process.env.SCRIPTDIR, '.temp', 'classinfo.json');
if (fs.existsSync(classinfo_path)) {
  CLASSINFO = JSON.parse(fs.readFileSync(classinfo_path));
}

function class_extractor(package_path, classname) {

  const envfile_path = path.join(package_path, '.env');
  const envfile = fs.readFileSync(envfile_path, 'utf-8').split('\n');

  let src_path, local_package_path, atomic_type;

  for (let line of envfile) {
    if (line.startsWith(classname)) {
      const split = line.split("=")[1]
      if (line.startsWith(classname + "Folder")) {
        local_package_path = split;
      }
      else {
        src_path = split;
      }
    }
    else if (line.startsWith('ATOMICTYPE')) {
      atomic_type = line.split("=")[1]
    }
  }

  if (!atomic_type) {
    const atomic_match = package_path.match(/packages\/([^\/]+)/);
    if (!atomic_match) {
      console.log('[ANALYSE] ❌ error - could not established atomic-type');
      return null;
    }

    atomic_type = atomic_match[1];
  }

  const classinfo_name = `${atomic_type}-${classname}`;
  if (CLASSINFO[classinfo_name]) return CLASSINFO[classinfo_name];

  if (!src_path) {
    // its not present in the .env
    if (process.env.VERBOSE) console.log(`[ANALYSE] 🟨 warning - "${classname}" not present in .env in ${package_path} - reverting to greedy approach!`);


    const greedyinfo = greedy(package_path, classname);
    if (greedyinfo) {
      return greedyinfo;
    }
    else {
      console.log('[ANALYSE] ❌ error - even greedy failed..', package_path, classinfo_name, CLASSINFO, classname);
      return null;
    }
  }

  const filepath = path.join(package_path, src_path);
  const folderpath = path.join(package_path, local_package_path);
  const filtpath_dist = filepath.split('src').join('dist/src').replace('.ts', '.js');

  // get greedy info 
  const classextend_info_cases = extract_classname_extend(path.join(package_path, 'dist', src_path.replace('.ts', '.d.ts')));
  if (!classextend_info_cases) {
    console.log('[ANALYSE] ❌ error - something went wrong extracting class names');
    return null;
  }

  let finalinfo = null;

  let bumps = 0;
  // since 1 file can contain multiple export classes (looking at menu-template........)
  for (let classextend_info of classextend_info_cases) {
    const info = {
      ...classextend_info,
      package: package_path,
      atomic_type,
      path: filepath,
      folder: folderpath,
      dist: filtpath_dist,
    };

    CLASSINFO[classinfo_name] = info;

    if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - classinfo saved');
    bumps++;
  }

  if (bumps > 0) {
    // lets always save the classname info 
    fs.writeFileSync(path.join(process.env.SCRIPTDIR, '.temp', 'classinfo.json'), JSON.stringify(CLASSINFO), 'utf-8');
  }

  if (finalinfo === null) {
    console.log('[ANALYSE] ❌ error - could not find the target class in last resort mode');
  }

  return finalinfo;
}
function greedy(package_path, classname) {
  // start with main compoennt 
  const maininfo = greedy_helper(package_path, 'src', 'component', classname);
  if (maininfo) return maininfo;

  const entries = fs.readdirSync(path.join(package_path, 'src/components'), {withFileTypes: true});
  const subfolders = entries.filter(entry => entry.isDirectory()).map(entry => entry.name);

  for (let subfolder of subfolders) {
    const subinfo = greedy_helper(package_path, 'src/components/' + subfolder, 'index', classname);
    if (subinfo) return subinfo;
  }

  return null;
}
function greedy_helper(package_path, folder, filename, classname) {
  const atomic_match = package_path.match(/packages\/([^\/]+)/);
  if (!atomic_match) {
    console.log('[ANALYSE] ❌ error - could not established atomic-type');
    return null;
  }

  let targetname = null;
  let bumps = 0;
  const cases = extract_classname_extend(path.join(package_path, 'dist', folder, filename + '.d.ts'));
  for (let c of cases) {
    const {name, extend} = c;
    const classinfo_name = `${atomic_match[1]}-${name}`;
    if (!CLASSINFO[classinfo_name]) {
      const filepath = path.join(package_path, folder, filename + '.ts');
      CLASSINFO[classinfo_name] = {
        package: package_path,
        atomic_type: atomic_match[1],
        path: filepath,
        folder: path.join(package_path, folder),
        dist: filepath.split('src').join('dist/src').replace('.ts', '.js'),
        name,
        extend
      };

      if (process.env.VERBOSE) console.log('[ANALYSE] 🟦 info - classinfo saved');
      bumps++;
    }


    if (name === classname) targetname = classinfo_name;
  }

  if (bumps > 0) {
    // lets always save the classname info 
    fs.writeFileSync(path.join(process.env.SCRIPTDIR, '.temp', 'classinfo.json'), JSON.stringify(CLASSINFO), 'utf-8');
  }

  if (targetname) return CLASSINFO[targetname];
  return null;
}
function extract_classname_extend(filepath) {
  const content = fs.readFileSync(filepath, 'utf-8');
  const linematches = content.match(/export declare class .+ {/g);
  if (linematches) {
    const cases = [];
    for (let m of linematches) {
      const matchcase = m.match(/class (.+) extends (.+) \{/);

      if (matchcase) {
        cases.push({
          name: matchcase[1],
          extend: matchcase[2],
        });
      }
    }

    if (cases.length === 0) return null;

    return cases;
  }

  return null;
}

module.exports = {
  class_extractor,
  CLASSINFO,
}