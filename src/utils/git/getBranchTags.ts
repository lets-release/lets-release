import { $, Options } from "execa";

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
  options: Partial<Omit<Options, "lines">> = {},
) {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`git tag --merged ${branch}`;

  return stdout.map((tag) => tag.trim()).filter((tag) => !!tag);
}
