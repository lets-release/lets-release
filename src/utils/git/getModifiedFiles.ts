import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

/**
 * Retrieve the list of files modified on the local repository.
 *
 * @param options Options to pass to `execa`.
 *
 * @return Array of modified files path.
 */
export async function getModifiedFiles(options: Partial<Options> = {}) {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`git ls-files -m -o`;

  return stdout.flatMap((file) => {
    const trimmed = stripAnsi(file).trim();

    if (trimmed) {
      return [trimmed];
    }

    return [];
  });
}
