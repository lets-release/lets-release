import { $, Options } from "execa";

/**
 * Retrieve the list of files modified on the local repository.
 *
 * @param options Options to pass to `execa`.
 *
 * @return Array of modified files path.
 */
export async function getModifiedFiles(
  options: Partial<Omit<Options, "lines">> = {},
) {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`git ls-files -m -o`;

  return stdout.map((file) => file.trim()).filter(Boolean);
}
