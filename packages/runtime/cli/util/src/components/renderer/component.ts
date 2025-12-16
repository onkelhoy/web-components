// import statements 
import readline from "node:readline";

export class Renderer {
  static lines: number = 0;
  private static session: number|null = null;

  static write(...values: string[]) {
    const value = values.join(" ");
    this.printLine(value);
  }

  static error(...values: string[]) {
    const value = values.join(" ");
    this.printLine(value, "error");
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

  static clear(start: number = 0, end?: number) {
    this.clearLastLines((end ?? this.lines) - start)
  }

  private static clearLastLines(n: number) {
    if (n <= 0) return;

    this.lines = Math.max(this.lines - n, 0);

    for (let i = 0; i < n; i++) {
      process.stdout.write('\x1b[2K'); // clear current line
      if (i < n - 1) process.stdout.write('\x1b[1A'); // move up unless it’s the last line
    }
    process.stdout.write('\r'); // move cursor to start of line
  }

  static async prompt(promptText: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      let input = "";

      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);

      this.write(promptText); // -> line 1
      this.print("\r\x1b[2K> "); 

      const onKeypress = (str: string, key: any) => {
        if (key.ctrl && key.name === "c" || str === "\x04" || key.ctrl && key.name === "d") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", onKeypress);
          this.write("\ncancelled");
          process.exit();
        }

        if (key.name === "return") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", onKeypress);
          this.write(); 
          resolve(input);
          return;
        }

        if (key.name === "backspace") {
          input = input.slice(0, -1);
        } else if (!key.ctrl && !key.meta) {
          input += str;
        }

        // redraw current line in-place
        this.print(`\r\x1b[2K> ${input}`);
      };

      process.stdin.on("keypress", onKeypress);
    });
  }

  static async getAnswer(question: string, acceptables: string[]): Promise<string>;
  static async getAnswer(question: string, acceptables: ((answer: string) => Promise<boolean>)): Promise<string>;
  static async getAnswer(question: string, acceptables: string[] | ((answer: string) => Promise<boolean>)) {
    this.createSession();
    let answer = await this.prompt(question);

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
      answer = await this.prompt(question); // this will increase lines by 3
    }

    this.closeSession();
    return answer;
  }

  static async option(options: string[], promptText = "Pick your option (arrow up and arrow down + enter)") {
    return new Promise<number>((resolve, reject) => {
      let input = "";
      
      readline.emitKeypressEvents(process.stdin);
      if (process.stdin.isTTY) process.stdin.setRawMode(true);
      
      this.write(promptText);
      this.write();
      this.createSession();

      function printoptions(clear = true) {
        if (clear) Renderer.clearSession();
        for (let i=0; i<options.length; i++)
        {
          const str = `${i+1}) ${options[i]}`
          if (i === index)
          {
            Renderer.write(`-> ${str}`)
          }
          else 
          {
            Renderer.write(str);
          }
        }
      }
      
      let index = 0;
      printoptions(false);

      const onKeypress = (str: string, key: any) => {
        if (key.ctrl && key.name === "c" || str === "\x04" || key.ctrl && key.name === "d") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", onKeypress);
          this.write("\ncancelled");
          process.exit();
        }

        if (key.name === "return") {
          process.stdin.setRawMode(false);
          process.stdin.removeListener("keypress", onKeypress);
          this.write(); // move to next line -> line 3
          resolve(index);
          return;
        }

        if (/up/i.test(key.name))
        {
          index--;
          if (index < 0) index = options.length - 1;
          printoptions();
        }
        else if (/down/i.test(key.name))
        {
          index++;
          if (index >= options.length) index = 0;
          printoptions();
        }
      };

      process.stdin.on("keypress", onKeypress);
    });
  }

  static async confirm(question: string, defaultValue = false) {
    let answer = defaultValue;
    await this.getAnswer(question, async ans => {
      if (ans == "") 
      {
        return true;
      }

      const lower = ans.toLowerCase();
      if (lower.startsWith("y") || lower === "1" || lower.startsWith("t")) 
      {
        answer = true;
      }
      else
      {
        answer = false;
      }
      return true;
    })

    return answer;
  }

  static print(value: string, type: "info"|"error" = "info") {
    if (type === "error")
    {
      process.stderr.write(value);
    }
    else 
    {
      process.stdout.write(value);
    }

    const lineCount = value.split("\n").length; // count number of actual printed lines
    this.lines += Math.max(lineCount - 1, 0);
  }

  static printLine(value: string = "", type: "info"|"error" = "info") {
    this.print(value+"\n", type);
  }
}