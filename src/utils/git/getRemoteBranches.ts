import { $, Options } from "execa";

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

  return stdout
    .map((branch) => /^.+refs\/heads\/(?<branch>.+)$/.exec(branch)?.[1]?.trim())
    .filter((branch) => !!branch) as string[];
}
