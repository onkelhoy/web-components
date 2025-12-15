/**
 * Parses command-line arguments from `process.argv` into flags and positional values.
 *
 * Supports:
 * - Long flags: `--name` or `--name=value`
 * - Short flags: `-n` or `-n value`
 * - Grouped short flags: `-abc` → `{ a, b, c }` all undefined
 *
 * Flags listed in `islands` will not consume the next argument as their value.
 *
 * @param {string[]} [islands=[]] - Flag names that should not consume the next argument.
 * @returns {{ flags: Record<string, string | undefined>, values: string[] }}
 *
 * @example
 * // process.argv = ["node", "script.js", "--foo=bar", "-abc", "positional", "--baz", "qux"]
 * ExtractArguments(["baz"]);
 * // => {
 * //    flags: { foo: "bar", a: undefined, b: undefined, c: undefined, baz: undefined },
 * //    values: ["positional", "qux"]
 * // }
 */

type Arguments = { flags: Record<string, string | undefined>, values: string[] };
export function getArguments(islands:string[] = []) {
  const _arguments:Arguments = {
    flags: {},
    values: [],
  };
  let prevWasFlag = null;
  for (let i=2; i<process.argv.length; i++)
  {
    const arg = process.argv[i];
    let match = arg.match(/^(?<flag>--?)(?<name>[^=]+)(=(?<value>.*))?$/);
    if (!match)
    {
      if (prevWasFlag) 
      {
        _arguments.flags[prevWasFlag] = arg;
      }
      else 
      {
        _arguments.values.push(arg);
      }

      prevWasFlag = null;
      continue;
    }

    const { value, name } = match.groups ?? {};

    if (match.groups?.flag == "-" && value)
    {
      // we treat as multiple groups 
      for (let j=0; j<name.length; j++)
      {
        const group = name[j];
        if (!_arguments.flags[group]) _arguments.flags[group] = undefined;
      }
      continue;
    }
  
    if (!islands.includes(name))
    {
      prevWasFlag = name;
    }

    if (!_arguments.flags[name]) _arguments.flags[name] = value;
  }

  return _arguments;
}