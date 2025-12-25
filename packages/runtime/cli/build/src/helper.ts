import { Arguments, Terminal } from "@papit/util-cli";
import { spawn } from "node:child_process";

export function spawnCommand(command: string, cwd: string, args: string[] = []) {
  const [cmd, ..._args] = command.split(" ");

  return new Promise<void>((resolve, reject) => {
    const child = spawn(cmd, _args.concat(args), {
      cwd,
      // stdio: "inherit",
      // stdio: ['ignore', 'ignore', 'ignore'],
      stdio: "pipe",
      shell: false,
      env: { ...process.env },
    });

    // child.on("message", message => {
    //   console.log('inocoming message', message)
    // })

    if (Arguments.verbose) 
    {
      child.stdout.on("data", (chunk) => {
        Terminal.print(chunk);
      }); 
    }
    else 
    {
      child.stdout.on("data", () => {}); // ignore
    }
    
    child.stderr.on("data", chunk => Terminal.print(chunk, "error")); // ignore

    child.on("close", code => {
      if (code === 0) resolve();
      else 
      {
        reject(new Error(`prebuild failed (${code})`));
        process.exit(1);
      }
    });
  });
}