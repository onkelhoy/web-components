// import statements 
import readline from "node:readline";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { spawn } from "node:child_process";

import { SpawnOptions } from "./types";
import { Printer } from "./printer";

const originalStdoutWrite = process.stdout.write.bind(process.stdout);
const originalStderrWrite = process.stderr.write.bind(process.stderr);

process.stdout.write = (chunk: any, encoding?: any, cb?: any) => {
  Terminal.track(chunk.toString());
  return originalStdoutWrite(chunk, encoding, cb);
};

process.stderr.write = (chunk: any, encoding?: any, cb?: any) => {
  Terminal.track(chunk.toString());
  return originalStderrWrite(chunk, encoding, cb);
};

export class Terminal extends Printer {
  private static prompt_completer(line: string): [string[], string] {
    try {
      const startsWithTilde = line.startsWith('~');
      const isEmpty = line.trim() === '';

      // Expand ~ to home directory for processing
      let absolutePath = line.startsWith('~') 
        ? line.replace(/^~/, os.homedir())
        : line;

      // If path is relative or empty, resolve it from cwd
      if (!absolutePath.startsWith('/')) {
        absolutePath = path.resolve(process.cwd(), absolutePath);
      }

      const dir = absolutePath.endsWith('/') ? absolutePath : path.dirname(absolutePath);
      const partial = absolutePath.endsWith('/') ? '' : path.basename(absolutePath);

      // Read directory contents
      const files = fs.readdirSync(dir);

      // Filter files that match the partial input
      const hits = files
        .filter(f => f.startsWith(partial) && !f.startsWith("."))
        .map(f => {
          const fullPath = path.join(dir, f);
          try {
            const isDir = fs.statSync(fullPath).isDirectory();
            return isDir ? f + '/' : f;
          } catch {
            return f;
          }
        });

      // Format completions to preserve user's input style
      const completions = hits.map(hit => {
        if (startsWithTilde) {
          // If user typed ~, show paths relative to home with ~
          const homeRelative = path.relative(os.homedir(), path.join(dir, hit));
          return '~/' + homeRelative;
        } 
        
        if (isEmpty || !line.startsWith('/')) {
          // If relative path or empty, show relative to cwd
          const base = line.endsWith('/') ? line : (path.dirname(line) === '.' ? '' : path.dirname(line) + '/');
          return base + hit;
        } 
        
        // If absolute path, show absolute
        return path.join(dir, hit);
      });

      return [completions.length ? completions : [], line];
    }
    catch { return [[], line] }
  }
  static async prompt(promptText: string, inline?: boolean): Promise<string> {
    return new Promise<string>((resolve) => {
      let answered = false;

      // Create a readline interface - this handles all cursor movement, 
      // line editing, and terminal features automatically
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
        terminal: true,
        completer: this.prompt_completer // Enable tab completion
      });

      const printer = (answer: string) => {
        answered = true;
        rl.close();
        
        // Convert to absolute path before resolving
        let finalPath = answer.trim();
        if (finalPath.startsWith('~')) {
          finalPath = finalPath.replace(/^~/, os.homedir());
        }
        if (!finalPath.startsWith('/')) {
          finalPath = path.resolve(process.cwd(), finalPath);
        }
        
        resolve(finalPath);
      }

      // If not inline, print the prompt text on a separate line first
      if (!inline) {
        this.write(promptText);
        rl.question("> ", printer);
      } else {
        // For inline, include prompt text with the question
        rl.question(`${promptText}: `, printer);
      }

      // Handle Ctrl+C gracefully
      rl.on('SIGINT', () => {
        rl.close();
        this.error("\ncancelled");
        process.exit();
      });

      // Handle Ctrl+D (EOF) - only exit if user didn't answer normally
      rl.on('close', () => {
        if (!answered) {
          this.error("\ncancelled");
          process.exit();
        }
      });
    });
  }
  
  static async getAnswer(question: string, acceptables: string[], inline?: boolean): Promise<string>;
  static async getAnswer(question: string, acceptables: ((answer: string) => Promise<boolean>), inline?: boolean): Promise<string>;
  static async getAnswer(question: string, acceptables: string[] | ((answer: string) => Promise<boolean>), inline?: boolean) {
    return Terminal.sessionBlock(async () => {
      let answer = await this.prompt(question, inline);

      while (
        (Array.isArray(acceptables) && !acceptables.includes(answer)) ||
        (typeof acceptables === "function" && !await acceptables(answer))
      )
      {
        this.clearSession(); // this will restart session 
        if (Array.isArray(acceptables))
        {
          this.warn(`acceptable answer: [${acceptables.join(", ")}]`); // this will increase lines by 1 
        } else
        {
          this.warn("answer did not pass validation, try again"); // this will increase lines by 1 
        }
        answer = await this.prompt(question, inline); // this will increase lines by 3
      }

      return answer;
    });
  }

  static async option(options: string[] | string[][], promptText = "↑↓ select • Enter confirm", currentMarker = "●", defaultMarker = "◯") {
    return Terminal.sessionBlock(async () => new Promise<number>((resolve, reject) => {
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);

      const _options = options.flat();
      const spaces = new Set<number>();
      if (Array.isArray(options[0]))
      {
        for (let i = 0; i < options.length - 1; i++)
        {
          spaces.add(options[i].length);
        }
      }

      this.write(promptText);
      this.createSession();

      function printoptions(clear = true) {
        if (clear) Terminal.clearSession();

        for (let i = 0; i < _options.length; i++)
        {
          if (spaces.has(i)) 
          {
            Terminal.write();
          }

          const prefix = i === index ? currentMarker : defaultMarker;
          Terminal.write(`${prefix} ${_options[i]}`);
        }
      }

      let index = 0;
      printoptions(false);

      function handleKeydown(str: string, key: any) {

        const enter = /return/i.test(key.name) || /space/i.test(key.name);
        if (key.ctrl && key.name === "c" || str === "\x04" || key.ctrl && key.name === "d" || enter)
        {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", handleKeydown);

          if (enter)
          {
            resolve(index);
            return;
          }

          Terminal.error("\ncancelled");
          process.exit();
        }

        if (/up/i.test(key.name) || key.shift && /tab/i.test(key.name))
        {
          index--;
          if (index < 0) index = _options.length - 1;
          printoptions();
        }
        else if (/down/i.test(key.name) || /tab/i.test(key.name))
        {
          index++;
          if (index >= _options.length) index = 0;
          printoptions();
        }
      };

      process.stdin.on("keypress", handleKeydown);
    }));
  }

  static async confirm(question: string, defaultValue = false) {
    const options = defaultValue ? ["yes", "no"] : ["no", "yes"];

    const answer = await this.option(options, question);

    return defaultValue ? answer === 0 : answer === 1;
  }

  static execute(command: string, cwd: string): Promise<void>;
  static execute(command: string, cwd: string, args: string[]): Promise<void>;
  static execute(command: string, options: Partial<SpawnOptions>): Promise<void>;
  static execute(command: string, something: Partial<SpawnOptions> | string, args?: string[]) {

    let options: Partial<SpawnOptions> = {};
    if (typeof something === "string")
    {
      options.cwd = something;
      if (args) options.args = args;
    }
    else 
    {
      options = something;
    }

    return new Promise<void>((res, rej) => {
      this.spawn(command, {
        ...options,
        onClose(code, stdout, stderr) {
          if (code === 0)
          {
            options.onClose?.(0, stdout, stderr);
            return res();
          }

          rej(new Error(stderr || stdout || `Process exited with code ${code}`));
        }
      });
    });
  }

  static spawn(command: string, options: Partial<SpawnOptions>) {
    const [cmd, ..._args] = command.split(" ");

    let stdout = "";
    let stderr = "";

    const child = spawn(cmd, _args.concat(options.args ?? []), {
      cwd: options.cwd,
      stdio: "pipe",
      shell: false,
      env: { ...process.env },
    });

    child.stdout.on("data", chunk => {
      const text = chunk.toString("utf8");
      stdout += text;
      options.onData?.(text);
    });

    child.stderr.on("data", chunk => {
      const text = chunk.toString("utf8");
      stderr += text;
      options.onError?.(text);
    });

    child.on("close", code => options.onClose?.(code, stdout, stderr));

    return child;
  }
}