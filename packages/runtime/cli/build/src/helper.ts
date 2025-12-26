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
    
    child.stdout.on("data", () => {}); // ignore
    child.stderr.on("data", () => process.exit(1)); // ignore + exit 

    child.on("close", code => {
      if (code === 0) resolve();
      else 
      {
        reject(new Error("code: " + code));
      }
    });
  });
}