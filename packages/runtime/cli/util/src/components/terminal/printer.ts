import { Colors } from "./color";

export class Printer extends Colors {

  static lines: number = 0;
  static session: number | null = null;

  static write(...values: any[]) {
    this.printLine(this.getString(" ", values));
  }

  static warn(...values: any[]) {
    this.semantic(`🟡 ${process.stdout.isTTY ? this.yellow("warn ") : ""}`, values);
  }

  static error(...values: any[]) {
    this.semantic(`🔴 ${process.stdout.isTTY ? this.red("error ") : ""}`, values);
  }

  private static semantic(prefix: string, values: any[]) {
    let value = this.getString(" ", values);
    const match = value.match(/^(\n)*/);

    let leading = "";
    if (match)
    {
      leading = match[0];
      value = value.slice(Math.max(0, leading.length * 2 - 1));
    }

    this.printLine(`${leading}${prefix}${value}`, "error");
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
    try
    {
      ans = await callback();
    }
    finally
    {
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
}
