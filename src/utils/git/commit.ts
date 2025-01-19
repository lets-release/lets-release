import { $, Options } from "execa";

/**
 * Commit to the local repository.
 *
 * @param message Commit message.
 * @param options Options to pass to `execa`.
 */
export async function commit(message: string, options: Partial<Options> = {}) {
  await $(options)`git commit -m ${message}`;
}
