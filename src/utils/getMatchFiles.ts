import debug from "debug";
import { sync } from "dir-glob";
import { isArray, uniq } from "lodash-es";
import micromatch from "micromatch";

import { BaseContext, GlobPattern } from "@lets-release/config";

import { name } from "src/program";

export function getMatchFiles(
  { repositoryRoot }: Pick<BaseContext, "repositoryRoot">,
  files: string[],
  asset: GlobPattern,
) {
  // Wrap single glob definition in Array
  let patterns = isArray(asset) ? asset : [asset];

  patterns = uniq([...sync(patterns, { cwd: repositoryRoot }), ...patterns]);

  let nonegate = false;

  // Skip solo negated pattern (avoid to include every non js file with `!**/*.js`)
  if (patterns.length <= 1 && patterns[0].startsWith("!")) {
    nonegate = true;

    debug(`${name}:utils.getMatchFiles`)(
      `skipping the negated glob ${patterns[0]} as its alone in its group and would retrieve a large amount of files`,
    );
  }

  return micromatch(files, patterns, {
    cwd: repositoryRoot,
    dot: true,
    nonegate,
  });
}
