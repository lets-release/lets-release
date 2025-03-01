import { $ } from "execa";
import stripAnsi from "strip-ansi";

export async function getStagedFiles(cwd: string) {
  const { stdout } = await $<{ cwd: string; lines: true }>({
    cwd,
    lines: true,
  })`git status --porcelain`;

  return stdout.flatMap((line) => {
    const trimmed = stripAnsi(line).trim();

    if (trimmed.startsWith("A ")) {
      return [/^A\s+(?<file>.+)$/.exec(trimmed)?.[1]];
    }

    return [];
  }) as string[];
}
