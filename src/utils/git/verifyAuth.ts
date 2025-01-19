import { debug } from "debug";
import { $, Options } from "execa";

import { name } from "src/program";

/**
 * Verify the write access authorization to remote repository with push dry-run.
 *
 * @param repositoryUrl The remote repository url.
 * @param branch The repository branch for which to verify write access.
 * @param options Options to pass to `execa`.
 *
 * @throws {Error} if not authorized to push.
 */
export async function verifyAuth(
  repositoryUrl: string,
  branch: string,
  options: Partial<Options> = {},
) {
  try {
    await $(
      options,
    )`git push --dry-run --no-verify ${repositoryUrl} ${`HEAD:${branch}`}`;
  } catch (error) {
    debug(`${name}:utils.git.verifyAuth`)(error);

    throw error;
  }
}
