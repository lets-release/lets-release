import { $, Options } from "execa";

/**
 * Add a list of file to the Git index. `.gitignore` will be ignored.
 *
 * @param files Array of files path to add to the index.
 * @param options Options to pass to `execa`.
 */
export async function addFiles(
  files: string[],
  options: Partial<Options> = {},
) {
  await $({
    ...options,
    reject: false,
  })`git add --force --ignore-errors ${files}`;
}
