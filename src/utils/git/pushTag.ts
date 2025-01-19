import { $, Options } from "execa";

/**
 * Push tags to the remote repository.
 *
 * @param repositoryUrl The remote repository URL.
 * @param tag Tag.
 * @param options Options to pass to `execa`.
 */
export async function pushTag(
  repositoryUrl: string,
  tag: string,
  options: Partial<Options> = {},
) {
  await $(options)`git push ${repositoryUrl} ${tag}`;
}
