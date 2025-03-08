import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

import { getHeadHash } from "src/utils/git/getHeadHash";

/**
 * Verify the local branch is up to date with the remote one.
 *
 * @param repositoryUrl The remote repository url.
 * @param branch The repository branch for which to verify status.
 * @param options Options to pass to `execa`.
 *
 * @return `true` is the HEAD of the current local branch is the same as the HEAD of the remote branch, falsy otherwise.
 */
export async function isBranchUpToDate(
  repositoryUrl: string,
  branch: string,
  options: Partial<Options> = {},
) {
  const head = await getHeadHash(options);
  const { stdout } = await $<{ lines: false }>({
    ...options,
    lines: false,
  })`git ls-remote --heads ${repositoryUrl} ${branch}`;

  return head === /^(?<ref>\w+)?/.exec(stripAnsi(stdout).trim())?.[1];
}
