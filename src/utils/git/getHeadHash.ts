import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

/**
 * Get the HEAD sha.
 *
 * @param options Options to pass to `execa`.
 *
 * @return The sha of the HEAD commit.
 */
export async function getHeadHash(
  options: Partial<Omit<Options, "lines">> = {},
) {
  const { stdout } = await $<{ lines: false }>({
    ...options,
    lines: false,
  })`git rev-parse HEAD`;

  return stripAnsi(stdout).trim();
}
