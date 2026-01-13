
import path from "node:path";
import fs from "node:fs";

import { Arguments, getJSON, getPathInfo, LocalPackage, Terminal } from "@papit/util"
import { packageRunner } from "./components/runners/package";
import { componentRunner } from "./components/runners/component";
import { getFolders } from "./components/util";
import { projectRunner } from "components/runners/project";

(async function () {
    Arguments.islands = ["install", "commit", "agree"]
    const info = getPathInfo(undefined, import.meta.url);

    if (Arguments.verbose)
    {
        process.env.verbose = "true";
    }

    if (!info.script)
    {
        Terminal.error("could not find @papit/create");
        process.exit(1);
    }

    const CREATE_PACKAGE = getJSON<LocalPackage>(path.join(info.script, "package.json"));
    if (!CREATE_PACKAGE)
    {
        Terminal.error("could not find @papit/create package.json");
        process.exit(1);
    }

    if (!process.env.USER)
    {
        Terminal.createSession();
        process.env.USER = await Terminal.prompt("your name", true);
        Terminal.clearSession();
    }

    Terminal.write();
    Terminal.write("@papit/create", Terminal.yellow(CREATE_PACKAGE.version), "- running");
    Terminal.write();

    const localRunnerSet = new Set<string>();
    const localRunnersLocation = path.join(info.root, "bin/runners");
    const options = ["package", "component", "project", "showcase"];
    try
    {
        const folders = getFolders(localRunnersLocation);
        folders.forEach(folder => {
            if (options.includes(folder)) return;

            const runnerFile = path.join(localRunnersLocation, folder, "runner.js");
            if (!fs.existsSync(runnerFile)) return;

            localRunnerSet.add(folder);
            options.push(folder);
        });
    }
    catch { }


    let option: number | null = null;
    for (let i = 0; i < options.length; i++)
    {
        if (Arguments.args.flags[options[i]]) 
        {
            option = i;
            break;
        }
    }

    if (option === null)
    {
        Terminal.createSession();
        option = await Terminal.option(options);
        Terminal.clearSession();
    }

    switch (option)
    {
        case 0:
            await packageRunner(info);
            break;
        case 1:
            await componentRunner(info);
            break;
        case 2:
            await projectRunner(info);
            break;
        default: {
            const runnerName = options[option];
            if (!localRunnerSet.has(runnerName))
            {
                Terminal.error("requested a runner that doesnt exist");
                process.exit(1);
            }

            const runnerFile = path.join(localRunnersLocation, runnerName, "runner.js");

            if (Arguments.verbose)
            {
                Terminal.write(`running local runner "${runnerName}"`);
            }

            const { default: runner } = await import(runnerFile);
            await runner(info, Arguments.args)
            break;
        }
    }

    process.exit();
}())