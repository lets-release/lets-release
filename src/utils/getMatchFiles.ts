import debug from "debug";
import { sync } from "dir-glob";
import { isArray, uniq } from "lodash-es";
import micromatch from "micromatch";

import { BaseContext, GlobPattern } from "@lets-release/config";

import { name } from "src/program";

const namespace = `${name}:utils.getMatchFiles`;

export function getMatchFiles(
  { repositoryRoot }: Pick<BaseContext, "repositoryRoot">,
  files: string[],
  asset: GlobPattern,
) {
  // Wrap single glob definition in Array
  let glob = isArray(asset) ? asset : [asset];

  // FIXME: Temporary workaround for https://github.com/mrmlnc/fast-glob/issues/47
  glob = uniq([...sync(glob, { cwd: repositoryRoot }), ...glob]);

  let nonegate = false;

  // Skip solo negated pattern (avoid to include every non js file with `!**/*.js`)
  if (glob.length <= 1 && glob[0].startsWith("!")) {
    nonegate = true;

    debug(namespace)(
      `skipping the negated glob ${glob[0]} as its alone in its group and would retrieve a large amount of files`,
    );
  }

  return micromatch(files, glob, {
    cwd: repositoryRoot,
    dot: true,
    nonegate,
  });
}
