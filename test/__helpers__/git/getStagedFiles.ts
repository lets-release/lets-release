import { $ } from "execa";

export async function getStagedFiles(cwd: string) {
  const { stdout } = await $<{ cwd: string; lines: true }>({
    cwd,
    lines: true,
  })`git status --porcelain`;

  return stdout
    .filter((status) => status.trim().startsWith("A "))
    .map((status) => /^A\s+(?<file>.+)$/.exec(status)?.[1]) as string[];
}
