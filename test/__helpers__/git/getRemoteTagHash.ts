import { $ } from "execa";
import stripAnsi from "strip-ansi";

export async function getRemoteTagHash(cwd: string, url: string, tag: string) {
  const { stdout } = await $({
    cwd,
    lines: true,
  })`git ls-remote --tags ${url} ${tag}`;

  return stdout.flatMap((tag) => {
    const trimmed = /^(?<tag>\S+)/.exec(stripAnsi(tag).trim())?.[1];

    if (trimmed) {
      return [trimmed];
    }

    return [];
  })[0];
}
