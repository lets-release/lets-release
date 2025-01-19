import { $, Options } from "execa";

export async function getCommittedFiles(
  commit: string,
  options: Partial<Omit<Options, "lines">> = {},
) {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`git diff-tree -r --root --no-commit-id --name-only ${commit}`;

  return (
    stdout
      // The prefix and suffix '"' are appended to the Korean path
      .map((line) => line.trim().replace(/^"/, "").replace(/"$/, ""))
      .filter((line) => !!line)
  );
}
