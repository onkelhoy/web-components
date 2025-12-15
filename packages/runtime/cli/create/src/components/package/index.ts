import path from "node:path";
import { exec } from "node:child_process";
import { promisify } from "node:util";

import { 
  getArguments,
  getAnswer,
  getJSON,
  getScope,
  getPackage,
  getName,
  copyFolder
} from "@papit/cli-util"

const TEMPLATE_PACKAGE = path.join(process.cwd(), ".scripts", "templates", "package");
const LOCKFILE_LOCATION = path.join(process.cwd(), "package-lock.json");
const execAsync = promisify(exec);

(async function() {
  const atomicTypes = ["atom", "molecule", "organism", "template"];
  const _arguments = getArguments(atomicTypes);
  const lockfile = getJSON(LOCKFILE_LOCATION);
  
  let atomicType = _arguments.flags['atomic-type'];
  
  if (!atomicTypes.includes(atomicType))
  {
    console.log('Choose Atomic Type:');
    console.log('1) atom');
    console.log('2) molecule');
    console.log('3) organism');
    console.log('4) template');
    console.log('')
    
    const answer = await getAnswer("answer: ", ["1", "2", "3", "4"]);
    atomicType = atomicTypes[Number(answer) - 1];
  }

  const scope = getScope();

  let name = getName(_arguments.flags.name);
  while (!name || getPackage(`${scope}/${name.safe}`, lockfile))
  {
    if (!name)
    {
      name = getName(await getAnswer("name of the package: "));
      continue; // trigger validation loop 
    }

    console.log(`package: "${name.safe}" already exists: "${`${scope}/${name.safe}`}"`);
    name = getName(await getAnswer("choose another name: "));
  }

  const fullName = `${scope}/${name.package}`;
  const destination = path.join(process.cwd(), "packages", atomicType + "s", name.package);

  // Copy package template
  await copyFolder(TEMPLATE_PACKAGE, destination, async file => {
    const final = file
      .replace(/VARIABLE_ATOMIC_TYPE/g, atomicType)
      .replace(/VARIABLE_USER/g, process.env.USER)
      .replace(/VARIABLE_COMPONENT_NAME/g, name.component)
      .replace(/VARIABLE_PACKAGE_NAME/g, name.package)
      .replace(/VARIABLE_FULL_NAME/g, fullName);

    return final;
  });

  
  console.log();
  const install = await getAnswer("do you wish to install and commit? [y/n]: ");
  if (/^(1|y)/.test(install.toLowerCase()))
  {
    try {
      await execAsync("npm install");
      await execAsync(`git add ${LOCKFILE_LOCATION}`);
      await execAsync(`git add ${destination}`);
      await execAsync(`git commit -m "add: ${atomicType} package created ${name.safe}"`);
    } catch (err) {
      console.error("❌ Error during install/commit:", err.stderr || err);
    }
  }

  console.log();
  console.log("✅ package created", { atomicType, name: name.safe, destination });
}())
