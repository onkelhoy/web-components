const fs = require("node:fs");
const path = require("node:path");
const { initializePackages, iterateSync } = require("./main");

const LOCKFILE = JSON.parse(fs.readFileSync(path.join(process.env.ROOTDIR, "package-lock.json")));

const listfilelocation = path.join(process.env.ROOTDIR, "bin/dependency-order/list");
// if (!fs.existsSync(listfilelocation)) {
// console.log('running setup')
// setup 
initializePackages(process.env.ROOTDIR, LOCKFILE, process.env.CHECKVERSION);
// }

let list = [];
iterateSync(batch => {
  list = list.concat(batch.map(info => `${info.name} ${info.location} ${info.version} ${info.changedversion || 0}`));
});

fs.writeFileSync(listfilelocation, list.join('\n'), "utf-8");