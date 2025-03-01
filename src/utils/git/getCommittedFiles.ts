import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

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
      .flatMap((line) => {
        const trimmed = stripAnsi(line)
          .trim()
          .replace(/^"/, "")
          .replace(/"$/, "");

        if (trimmed) {
          return [trimmed];
        }

        return [];
      })
  );
}
