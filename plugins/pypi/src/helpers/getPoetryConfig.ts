import { $, Options } from "execa";
import stripAnsi from "strip-ansi";

export async function getPoetryConfig(
  key: string,
  options: Partial<Options> = {},
): Promise<string | undefined> {
  try {
    const { stdout } = await $<{ lines: false; reject: true }>({
      ...options,
      lines: false,
      reject: true,
    })`poetry config ${key}`;

    return stripAnsi(stdout).trim();
  } catch {
    return;
  }
}
