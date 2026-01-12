import fs from "node:fs";
import path from "node:path";

const libs = fs.globSync("packages/**/lib/", {
  cwd: process.cwd(),
  absolute: true,
});

const temps = fs.globSync("packages/**/.temp/", {
  cwd: process.cwd(),
  absolute: true,
});

for (const dir of libs)
{
  fs.rmSync(dir, { recursive: true, force: true });
}

for (const temp of temps)
{
  fs.rmSync(temp, { recursive: true, force: true });
}
