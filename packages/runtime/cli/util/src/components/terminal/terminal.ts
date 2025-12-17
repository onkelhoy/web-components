// import statements 
import readline from "node:readline";

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

export class Terminal {
  static lines: number = 0;
  private static session: number | null = null;

  static write(...values: string[]) {
    const value = values.join(" ");
    this.printLine(value);
  }

  static error(...values: string[]) {
    const value = values.join(" ");
    this.printLine(value, "error");
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

      if (!inline) {
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
          this.write("\ncancelled");
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
    this.createSession();
    let answer = await this.prompt(question, inline);

    while (
      (Array.isArray(acceptables) && !acceptables.includes(answer)) ||
      (typeof acceptables === "function" && !await acceptables(answer))
    )
    {
      this.clearSession(); // this will restart session 
      if (Array.isArray(acceptables))
      {
        this.write(`acceptable answer: [${acceptables.join(", ")}]`); // this will increase lines by 1 
      } else
      {
        this.write("answer did not pass validation, try again"); // this will increase lines by 1 
      }
      answer = await this.prompt(question, inline); // this will increase lines by 3
    }

    this.closeSession();
    return answer;
  }

  static async option(options: string[], promptText = "↑↓ select • Enter confirm") {
    return new Promise<number>((resolve, reject) => {
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);
      const session = this.createSession();

      this.write();
      this.write(promptText);
      this.write();
      this.createSession();

      function printoptions(clear = true) {
        if (clear) Terminal.clearSession();

        for (let i = 0; i < options.length; i++)
        {
          const prefix = i === index ? "● " : "○";
          Terminal.write(`${prefix} ${options[i]}`);
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
            Terminal.clearSession(session);
            resolve(index);
            return;
          }

          Terminal.write("\ncancelled");
          process.exit();
        }

        if (/up/i.test(key.name) || key.shift && /tab/i.test(key.name))
        {
          index--;
          if (index < 0) index = options.length - 1;
          printoptions();
        }
        else if (/down/i.test(key.name) || /tab/i.test(key.name))
        {
          index++;
          if (index >= options.length) index = 0;
          printoptions();
        }
      };

      process.stdin.on("keypress", handleKeydown);
    });
  }

  static async confirm(question: string, defaultValue = false) {
    const options = defaultValue ? ["yes", "no"] : ["no", "yes"];

    const answer = await this.option(options, question);

    return defaultValue ? answer === 0 : answer === 1;
  }
}