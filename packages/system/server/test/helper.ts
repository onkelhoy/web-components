import { spawn } from 'node:child_process';

type Config = Partial<{
  port: number;
  package: string;
  view: string;
  live: boolean;
}>;
export function startServer(config: Config = {}) {

  const controller = new AbortController();
  const process = spawn(
    "npm start", [
    `--port=${config.port || 3000}`,
    `--package=${config.package || __dirname}`,
    `--view=${config.view || "test"}`,
    config.live === false ? '' : `--live=true`,
  ], {
    signal: controller.signal,
  });

  // spawn(`npm run start -- --port=${config.port || 3000} --package=${config.package || __dirname} --view=${config.view} --live=${config.live}`, (err, stdout, stderr) => {
  //   if (err) {
  //     console.error(err);
  //     return;
  //   }
  //   console.log()
  //   console.log(stdout);
  // });

  function kill() {
    controller.abort();
  }

  return {
    process,
    kill,
  }
}