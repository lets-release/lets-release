import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

export async function getHeadName(options: Partial<Options> = {}) {
  const { stdout } = await $<{ lines: false; reject: false }>({
    ...options,
    lines: false,
    reject: false,
  })`git rev-parse --abbrev-ref HEAD`;

  return stripAnsi(stdout).trim();
}
