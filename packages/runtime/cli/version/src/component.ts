// import statements 
import path from "node:path";
import fs from "node:fs";
import { Arguments, LocalPackage, Terminal, getDependencyBloodline, getJSON, getPathInfo } from "@papit/util-cli";

(async function () {
  const location = Arguments.args.flags.location;
  const originalinfo = getPathInfo(typeof location === "string" ? location : undefined);

  const packageJSON = getJSON<LocalPackage>(path.join(originalinfo.local, "package.json"));
  if (!packageJSON)
  {
    Terminal.error("package.json missing");
    throw new Error("package.json missing");
  }

  Arguments.args.flags.remote = true;
  Arguments.args.flags.includeRoot = true;

  await getDependencyBloodline(
    packageJSON.name, 
    async batch => {
      for (const b of batch) 
      {
        if (originalinfo.local === b.location) continue;
        if (b.changedversion) continue;
        const info = getPathInfo(b.location);
        const packageJSON = getJSON<LocalPackage>(path.join(info.local, "package.json"));
        if (!packageJSON)
        {
          Terminal.error(b.name ? `${b.name}'s package.json missing` : "package.json missing");
          throw new Error("package.json missing");
        }
  
        if (packageJSON.remoteVersion !== b.remoteversion && b.remoteversion !== undefined)
        {
          packageJSON.remoteVersion = b.remoteversion;
        }
        
        if (packageJSON.version !== packageJSON.remoteVersion) continue;
        
        const match = packageJSON.version.match(/^(?<major>\d+)\.(?<minor>\d+)\.(?<patch>\d+)$/);
        if (match?.groups)
        {
          packageJSON.version = `${match.groups.major}.${match.groups.minor!}.${Number(match.groups.patch)+1}`;
        }
        
        try 
        {
          fs.writeFileSync(path.join(info.local, "package.json"), JSON.stringify(packageJSON, null, 2), { encoding: "utf-8" });
        }
        catch (e)
        {
          Terminal.error(b.name, "version broke");
          if (Arguments.error)
          {
            console.log(e);
          }
        }
      }
    }, 
    { info: originalinfo, type: "descendants" }
  );
}());