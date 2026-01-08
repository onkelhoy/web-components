import path from "node:path";
import fs from "node:fs";
import { IncomingMessage } from "node:http";
import { Arguments, getPathInfo } from "@papit/util";

export function getURL(
  request: IncomingMessage,
  info: ReturnType<typeof getPathInfo>,
) {
  const rest = [Arguments.string("folder"), request.url].filter(v => v !== undefined);

  const potentials = [info.local, info.package, info.root];
  for (const potential of potentials)
  {
    const absolute = path.join(potential, ...rest);
    if (fs.existsSync(absolute)) return { absolute, relative: path.relative(potential, absolute) || path.relative(info.local, info.root) || "/" };
    if (fs.existsSync(info.local)) return { absolute: info.local, relative: path.relative(info.local, info.root) || "/" };
  }

  return { absolute: info.root, relative: "/" };
}