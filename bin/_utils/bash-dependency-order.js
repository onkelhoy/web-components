const fs = require("node:fs");
const path = require("node:path");
const {initializePackages, iterateSync} = require("./dependency-order");

const LOCKFILE = JSON.parse(fs.readFileSync(path.join(process.env.ROOTDIR, "package-lock.json")));

// setup 
initializePackages(process.env.ROOTDIR, LOCKFILE);

let list = [];
iterateSync(batch => {
  list = list.concat(batch.map(info => info.location));
});

console.log(list.join(' '));