import { $, Options } from "execa";
import normalizeUrl from "normalize-url";
import stripAnsi from "strip-ansi";

export async function getPoetryRegistries(
  options: Partial<Options> = {},
): Promise<{ name: string; publishUrl: string }[]> {
  const { stdout } = await $<{ lines: true }>({
    ...options,
    lines: true,
  })`poetry config --list`;

  const names = stdout.flatMap((line) => {
    const name = /^repositories\.(.+)\.url$/i.exec(
      stripAnsi(line).trim().split(" = ")[0].trim(),
    )?.[1];

    if (name) {
      return [name];
    }

    return [];
  });

  return await Promise.all(
    names.map(async (name) => {
      const { stdout } = await $<{ lines: false }>({
        ...options,
        lines: false,
      })`poetry config ${`repositories.${name}.url`}`;

      return {
        name,
        publishUrl: normalizeUrl(stripAnsi(stdout).trim()),
      };
    }),
  );
}
