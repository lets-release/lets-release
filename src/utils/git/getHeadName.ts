import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

export async function getHeadName(
  options: Partial<Omit<Options, "lines" | "reject">> = {},
) {
  const { stdout } = await $<{ lines: false; reject: false }>({
    ...options,
    lines: false,
    reject: false,
  })`git rev-parse --abbrev-ref HEAD`;

  return stripAnsi(stdout).trim();
}
