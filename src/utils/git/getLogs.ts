import { Options } from "execa";
import { fields, parse } from "git-log-parser";
import streamToArray from "stream-to-array";

import { Commit } from "@lets-release/config";

/**
 * Retrieve a range of commits.
 *
 * @param to to includes all commits made before this sha (also include this sha).
 * @param from to includes all commits made after this sha (does not include this sha).
 * @param options Options to pass to `execa`.
 *
 * @return The list of commits between `from` and `to`.
 */
export async function getLogs(
  to: string,
  from?: string,
  options: Partial<Options> = {},
): Promise<Commit[]> {
  Object.assign(fields, {
    hash: "H",
    message: "B",
    gitTags: "d",
    committerDate: { key: "ci", type: Date },
  });

  const commits = await streamToArray(
    parse(
      { _: `${from ? from + ".." : ""}${to}` },
      { cwd: options.cwd, env: { ...process.env, ...options.env } },
    ),
  );

  return commits.map(({ message, gitTags, ...commit }: Commit) => ({
    ...commit,
    message: message.trim(),
    gitTags: gitTags.trim(),
  }));
}
