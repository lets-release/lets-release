import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

/**
 * Get the commit sha for a given tag.
 *
 * @param tag Tag for which to retrieve the commit sha.
 * @param options Options to pass to `execa`.
 *
 * @return The commit sha of the tag in parameter or `null`.
 */
export async function getTagHash(
  tag: string,
  options: Partial<Options> = {},
): Promise<string> {
  const { stdout } = await $<{ lines: false }>({
    ...options,
    lines: false,
  })`git rev-list -1 ${tag}`;

  return stripAnsi(stdout).trim();
}
