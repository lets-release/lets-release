import { debug } from "debug";
import { $, Options } from "execa";

import { name } from "src/program";

/**
 * Get repo root
 *
 * @param options execa options
 * @returns string
 */
export async function getRoot(options: Partial<Omit<Options, "lines">> = {}) {
  try {
    const { stdout } = await $<{ lines: false }>({
      ...options,
      lines: false,
    })`git rev-parse --show-toplevel`;

    return stdout.trim();
  } catch (error) {
    debug(`${name}:utils.git.getRoot`)(error);

    throw error;
  }
}
