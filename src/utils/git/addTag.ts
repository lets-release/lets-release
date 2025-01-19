import { $, Options } from "execa";

/**
 * Tag the commit head on the local repository.
 *
 * @param tag The name of the tag.
 * @param ref The Git reference to tag.
 * @param options Options to pass to `execa`.
 *
 * @throws {Error} if the tag creation failed.
 */
export async function addTag(
  ref: string,
  tag: string,
  options: Partial<Options> = {},
) {
  await $(options)`git tag ${tag} ${ref}`;
}
