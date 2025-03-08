import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

/**
 * Get all the tags for a given branch.
 *
 * @param branch The branch for which to retrieve the tags.
 * @param options Options to pass to `execa`.
 *
 * @return List of git tags.
 * @throws If the `git` command fails.
 */
export async function getBranchTags(
  branch: string,
  options: Partial<Options> = {},
) {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`git tag --merged ${branch}`;

  return stdout.flatMap((tag) => {
    const trimmed = stripAnsi(tag).trim();

    if (trimmed) {
      return trimmed;
    }

    return [];
  });
}
