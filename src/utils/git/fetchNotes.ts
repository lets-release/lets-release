import { $, Options } from "execa";

/**
 * Unshallow the git repository if necessary and fetch all the notes.
 *
 * @param repositoryUrl The remote repository URL.
 * @param options Options to pass to `execa`.
 */
export async function fetchNotes(
  repositoryUrl: string,
  options: Partial<Options> = {},
) {
  try {
    await $(
      options,
    )`git fetch --unshallow ${repositoryUrl} ${"+refs/notes/*:refs/notes/*"}`;
  } catch {
    await $({
      ...options,
      reject: false,
    })`git fetch ${repositoryUrl} ${"+refs/notes/*:refs/notes/*"}`;
  }
}
