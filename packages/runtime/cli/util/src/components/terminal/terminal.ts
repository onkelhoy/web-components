// import statements 
import readline from "node:readline";
import { ChildProcessWithoutNullStreams, spawn } from "node:child_process";
import { Arguments } from "../arguments";
import { SpawnOptions } from "./types";

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


const ANSII_COLORS = {
  black:    30,
  red:      31,
  green:    32,
  yellow:   33,
  blue:     34,
  magenta:  35,
  cyan:     36,
  white:    37,

  "bright-black":    90,
  "bright-red":      91,
  "bright-green":    92,
  "bright-yellow":   93,
  "bright-blue":     94,
  "bright-magenta":  95,
  "bright-cyan":     96,
  "bright-white":    97,
}

export class Terminal {
  static lines: number = 0;
  static session: number | null = null;

  static colorWrap(value: string, color: keyof typeof ANSII_COLORS) {
    if (!process.stdout.isTTY) return value;
    return `\x1b[${ANSII_COLORS[color]}m${value}\x1b[0m`
  }

  static black(value:string) {
    return Terminal.colorWrap(value, "black");
  }
  static red(value:string) {
    return Terminal.colorWrap(value, "red");
  }
  static green(value:string) {
    return Terminal.colorWrap(value, "green");
  }
  static yellow(value:string) {
    return Terminal.colorWrap(value, "yellow");
  }
  static blue(value:string) {
    return Terminal.colorWrap(value, "blue");
  }
  static magenta(value:string) {
    return Terminal.colorWrap(value, "magenta");
  }
  static cyan(value:string) {
    return Terminal.colorWrap(value, "cyan");
  }
  static white(value:string) {
    return Terminal.colorWrap(value, "white");
  }
  static brightBlack(value:string) {
    return Terminal.colorWrap(value, "bright-black");
  }
  static brightRed(value:string) {
    return Terminal.colorWrap(value, "bright-red");
  }
  static brightGreen(value:string) {
    return Terminal.colorWrap(value, "bright-green");
  }
  static brightYellow(value:string) {
    return Terminal.colorWrap(value, "bright-yellow");
  }
  static brightBlue(value:string) {
    return Terminal.colorWrap(value, "bright-blue");
  }
  static brightMagenta(value:string) {
    return Terminal.colorWrap(value, "bright-magenta");
  }
  static brightCyan(value:string) {
    return Terminal.colorWrap(value, "bright-cyan");
  }
  static brightWhite(value:string) {
    return Terminal.colorWrap(value, "bright-white");
  }

  static write(...values: string[]) {
    const value = values.join(" ");
    this.printLine(value);
  }

  private static semantic(prefix:string, values:string[]) {
    let value = values.join(" ");
    const match = value.match(/^(\n)*/);

    let leading = "";
    if (match)
    {
      leading = match[0];
      value = value.slice(Math.max(0, leading.length * 2 - 1));
    }

    this.printLine(`${leading}${prefix}${value}`, "error");
  }

  static warn(...values: string[]) {
    this.semantic(`🟡 ${process.stdout.isTTY ? this.colorWrap("warn ", "yellow") : ""}`, values);
  }
  
  static error(...values: string[]) {
    this.semantic(`🔴 ${process.stdout.isTTY ? this.colorWrap("error ", "red") : ""}`, values);
  }

  static print(value: string, type: "info" | "error" = "info") {
    if (type === "error")
    {
      process.stderr.write(value);
    }
    else 
    {
      process.stdout.write(value);
    }
  }

  static track(value: string) {
    // Count newlines in the string
    const newlineCount = (value.match(/\n/g) || []).length;
    this.lines += newlineCount;
  }

  static printLine(value: string = "", type: "info" | "error" = "info") {
    this.print(value + "\n", type);
  }

  static clear(start: number = 0, end?: number) {
    const e = end ?? this.lines;
    this.lines = start;

    for (let i = start; i < e; i++)
    {
      process.stdout.write('\x1b[2K'); // clear entire line
      process.stdout.write('\x1b[1A'); // move cursor up one line
    }

    process.stdout.write('\x1b[2K');
    process.stdout.write('\r');
  }

  static async surpress<T = any>(callback: () => Promise<T>): Promise<T> {
    const originalWrite = process.stdout.write;
    process.stdout.write = () => true; // swallow all stdout

    let ans: T;
    try {
      ans = await callback();
    }
    finally {
      process.stdout.write = originalWrite;
      return ans!;
    }
  }

  static async sessionBlock<T = any>(callback: (session: number) => Promise<T>): Promise<T> {
    const previousSession = this.session;
    const session = this.createSession();
    const ans = await callback(session);
    this.clearSession();
    this.session = previousSession;

    return ans;
  }

  static createSession() {
    this.session = this.lines;

    return this.session;
  }

  static closeSession() {
    this.session = null;
  }

  static clearSession(session?: number) {
    const index = session ?? this.session;
    if (index === null) return;

    this.clear(index);
    this.closeSession();

    this.createSession();
  }

  static async prompt(promptText: string, inline?: boolean): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let input = "";

      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);

      if (!inline)
      {
        this.write(promptText); // -> line 1
        this.print("\r\x1b[2K> ");
      }
      else 
      {
        this.print(promptText + ": ");
      }

      const onKeypress = (str: string, key: any) => {
        if (key.ctrl && key.name === "c" || str === "\x04" || key.ctrl && key.name === "d")
        {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", onKeypress);
          this.error("\ncancelled");
          process.exit();
        }

        if (key.name === "return")
        {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", onKeypress);
          this.print("\n");
          resolve(input);
          return;
        }

        if (key.name === "backspace")
        {
          input = input.slice(0, -1);
        } else if (!key.ctrl && !key.meta)
        {
          input += str;
        }

        // redraw current line in-place
        if (!inline) 
        {
          this.print(`\r\x1b[2K> ${input}`);
        }
        else 
        {
          this.print(`\r\x1b[2K${promptText}: ${input}`);
        }
      };

      process.stdin.on("keypress", onKeypress);
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

  static async option(options: string[]|string[][], promptText = "↑↓ select • Enter confirm", currentMarker = "●", defaultMarker = "◯") {
    return Terminal.sessionBlock(async () => new Promise<number>((resolve, reject) => {
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);

      const _options = options.flat();
      const spaces = new Set<number>();
      if (Array.isArray(options[0]))
      {
        for (let i=0; i<options.length - 1; i++)
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
  static execute(command: string, cwd: string, args:string[]): Promise<void>;
  static execute(command: string, options: Partial<SpawnOptions>): Promise<void>;
  static execute(command: string, something: Partial<SpawnOptions>|string, args?: string[]) {

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
          if (code === 0) {
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