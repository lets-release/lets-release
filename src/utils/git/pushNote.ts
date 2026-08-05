import { $, Options } from "execa";

import { name } from "src/program";

/**
 * Push notes to the remote repository.
 *
 * @param repositoryUrl The remote repository URL.
 * @param options Options to pass to `execa`.
 *
 * @throws {Error} if the push failed.
 */
export async function pushNote(
  repositoryUrl: string,
  ref: string,
  options: Options = {},
) {
  await $(options)`git push ${repositoryUrl} ${`refs/notes/${name}-${ref}`}`;
}
