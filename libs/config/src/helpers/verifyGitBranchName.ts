import { $, Options } from "execa";

/**
 * Verify a branch name is a valid Git reference.
 *
 * @param branch the branch name to verify.
 * @param options Options to pass to `execa`.
 *
 * @return `true` if valid, falsy otherwise.
 */
export async function verifyGitBranchName(
  branch: string,
  options: Partial<Options> = {},
) {
  const { exitCode } = await $({
    ...options,
    reject: false,
  })`git check-ref-format ${`refs/heads/${branch}`}`;

  return exitCode === 0;
}
