/* eslint-disable indent */
const fs = require("fs");
const path = require("path");
const {spawn} = require('child_process');
const {iterate, initializePackages} = require('./dependency-order');

// variables
// const SEMANTIC_VERSION = process.env.SEMANTIC_VERSION;
const NPM_TOKEN = process.env.NPM_TOKEN;
const ROOTDIR = process.env.ROOTDIR;
const LOCKFILE = JSON.parse(fs.readFileSync(path.join(ROOTDIR, "package-lock.json")));
const VERBOSE = process.env.VERBOSE === "true";

let VERSIONDATA = null;

// setup 
initializePackages(ROOTDIR, LOCKFILE);

async function getjsonData() {
  return new Promise((res, rej) => {
    let jsonData = '';
    process.stdin.on('data', (chunk) => {
      jsonData += chunk;
    });

    process.stdin.on('end', () => {
      res(JSON.parse(jsonData));
    });

    process.stdin.on("error", (e) => {
      rej(e);
    })
  })
}

async function execute(list) {
  let executions = [];
  for (const info of list) {
    await execute_individual(info, VERSIONDATA);
    await wait(!!NPM_TOKEN ? 1000 : 10);
  }

  if (executions.length > 0) return Promise.all(executions);
}

function wait(n = 1000) {
  return new Promise(res => setTimeout(res, n));
}

async function execute_individual(info, VERSIONDATA) {
  let package_version = VERSIONDATA.find(d => d.name === info.name)?.version || '-0.0.0';
  if (NPM_TOKEN) console.log(`::group::${info.name} 📦`);
  else console.log(`\t${info.name} 📦`);

  if (info.name.endsWith('-depricated')) {
    CONFIRMLIST.push({status: 'depricated', title: info.name});
    if (NPM_TOKEN) {
      console.log(`::endgroup::`); // want to make sure status is outside the block
      console.log('[STATUS]: 🚫 depricated');
    }
    else {
      console.log('\t\t[STATUS]: 🚫 depricated');
    }
    return;
  }

  const scriptPath = path.join(__dirname, 'individual.sh');
  const args = [info.location, package_version];


  const childProcess = spawn(scriptPath, args);
  const status = await spawnLogs(childProcess);

  CONFIRMLIST.push({status, title: info.name});

  if (NPM_TOKEN) {
    console.log(`::endgroup::`); // want to make sure status is outside the block
    console.log(`[STATUS]: ${getStatusIcon(status)} ${status}`);
  }
  else {
    console.log(`\t\t[STATUS]: ${getStatusIcon(status)} ${status}`);
  }
}

function spawnLogs(process) {
  let errors = false;

  return new Promise((res) => {
    process.stdout.on('data', (data) => {
      const output = data.toString();

      if (output.includes("[individual]: skipped")) {
        res('skipped');
        return;
      }
      else if (output.includes("[individual]: complete")) {
        if (errors) {
          res("warning");
        }
        else {
          res("success");
        }
        return;
      }
      else if (VERBOSE) {
        const lines = output.split("\n");
        for (let line of lines) {
          const trimmed = line.toString().trim();
          if (trimmed !== "" && trimmed !== "E]") {
            if (NPM_TOKEN) console.log(trimmed); // Log for debugging
            else console.log(`\t\t[LOG] ${trimmed}`); // Log for debugging
          }
        }
      }
    });

    process.stderr.on('data', (data) => {
      const lines = data.toString().split('\n');

      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();

        if (line === "npm") {
          let next = lines[i + 1];
          if (next) {
            next = next.toString().trim();
            line += " " + next;
            i++;
          }
          else {
            // console.log("[DEBUG] <something is wrong with this line>", data.toString());
            continue;
          }
        }

        let state = 'NOTICE';
        if (!NPM_TOKEN) state = "LOG";

        if (line.startsWith('npm WARN') || line.startsWith('WARN')) {
          state = 'WARNING';
        }
        else if (line.startsWith('npm [ERROR]') || line.startsWith('[ERROR]')) {
          state = "ERROR";
        }
        else if (line.startsWith('npm notice') || line.startsWith('notice')) {
          if (NPM_TOKEN) state = "NOTICE";
          else state = "LOG";
        }

        // we want to logout error but not rest if its force mode (its local basically then)
        if (state === "ERROR" || VERBOSE) {
          console.log(`\t\t[${state}] ${line}`); // Log for debugging
        }

        if (state === "ERROR") {
          error = true;
        }
      }
    });

    process.on('close', (code) => {
      if (code !== 0) {
        res("failed");
        return
      }
    });
  })
}

function getStatusIcon(status) {
  if (status === "success") return "✅";
  if (status === "failed") return "❎";
  if (status === "warning") return "⚠️";
  if (status === "skipped") return "⏩";

  return "🚫"
}

async function init() {
  VERSIONDATA = await getjsonData();
  await iterate(execute, true, true); // print = true, grouping = true (github action printing ::group::)

  console.log('\n## Summery Report ⛱️')
  let prev = '';
  CONFIRMLIST.sort((a, b) => a.status.indexOf(b.status)).forEach(line => {
    if (prev !== line.status) {
      if (prev !== "" && NPM_TOKEN) console.log('::endgroup::');

      if (NPM_TOKEN) console.log(`::group::${line.status}: (${getStatusIcon(line.status)})`)
      else console.log(`${line.status}: (${getStatusIcon(line.status)})`)
      prev = line.status;
    }

    if (NPM_TOKEN) console.log(`- ${line.title}`);
    else console.log(`\t- ${line.title}`);
  })
}
const CONFIRMLIST = [];
init();
