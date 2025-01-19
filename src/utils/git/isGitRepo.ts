import { debug } from "debug";
import { $, Options } from "execa";

import { name } from "src/program";

/**
 * Test if the current working directory is a Git repository.
 *
 * @param options Options to pass to `execa`.
 *
 * @return `true` if the current working directory is in a git repository, falsy otherwise.
 */
export async function isGitRepo(options: Partial<Options> = {}) {
  try {
    await $(options)`git rev-parse --git-dir`;

    return true;
  } catch (error) {
    debug(`${name}:utils.git.isGitRepo`)(error);

    return false;
  }
}
