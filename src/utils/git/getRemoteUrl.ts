import debug from "debug";
import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

import { name } from "src/program";

/**
 * Get the repository remote URL.
 *
 * @param options Options to pass to `execa`.
 *
 * @return The value of the remote Git URL.
 */
export async function getRemoteUrl(
  remote = "origin",
  options: Partial<Options> = {},
) {
  try {
    const { stdout } = await $<{ lines: false }>({
      ...options,
      lines: false,
    })`git config --get ${`remote.${remote}.url`}`;

    return stripAnsi(stdout).trim();
  } catch (error) {
    debug(`${name}:utils.git.getRemoteUrl`)(error);
  }
}
