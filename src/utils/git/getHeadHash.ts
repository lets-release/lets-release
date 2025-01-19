import { $, Options } from "execa";

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

  return stdout.trim();
}
