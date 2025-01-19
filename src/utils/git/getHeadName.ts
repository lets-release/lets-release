import { $, Options } from "execa";

export async function getHeadName(
  options: Partial<Omit<Options, "lines" | "reject">> = {},
) {
  const { stdout } = await $<{ lines: false; reject: false }>({
    ...options,
    lines: false,
    reject: false,
  })`git rev-parse --abbrev-ref HEAD`;

  return stdout.trim();
}
