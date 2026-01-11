import fs from "node:fs";
import path from "node:path";
import {spawn} from "node:child_process";

const root = process.cwd();

if (fs.existsSync(path.join(root, "node_modules/.bin/papit-build")))
  process.exit(0);

function spawnCommand(command, cwd, args = []) {
  const [cmd, ..._args] = command.split(" ");

  return new Promise((resolve, reject) => {

    const child = spawn(cmd, _args.concat(args), {
      cwd,
      stdio: "pipe",
      shell: false,
      env: {...process.env},
    });

    // child.stdout.on("data", () => { });
    // child.stderr.on("data", process.exit(1));

    child.stdout.on("data", data => {
      process.stdout.write(data);
    });
    child.stderr.on("data", data => {
      process.stderr.write(data);
    });

    child.on("close", code => {
      if (code === 0) resolve();
      else 
      {
        reject(new Error("code: " + code));
      }
    });
  });
}

(async function () {
  console.log('bootstrapping');

  console.log('npm run prebuild - cli/util')
  await spawnCommand("npm run prebuild", path.join(root, "packages/runtime/cli/util"));
  console.log('npm run prebuild - cli/build')
  await spawnCommand("npm run build", path.join(root, "packages/runtime/cli/build"));
  console.log('npm install')
  await spawnCommand("npm install", root);
  console.log();
  console.log('bootstrapping - finished');
}());

