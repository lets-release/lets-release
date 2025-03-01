import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

/**
 * Get all the repository branches.
 *
 * @param repositoryUrl The remote repository url.
 * @param options Options to pass to `execa`.
 *
 * @return List of git branches.
 * @throws {Error} If the `git` command fails.
 */
export async function getRemoteBranches(
  repositoryUrl: string,
  options: Partial<Omit<Options, "lines">> = {},
): Promise<string[]> {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`git ls-remote --heads ${repositoryUrl}`;

  return stdout.flatMap((branch) => {
    const trimmed = /^.+refs\/heads\/(?<branch>.+)$/.exec(
      stripAnsi(branch).trim(),
    )?.[1];

    if (trimmed) {
      return [trimmed];
    }

    return [];
  });
}
