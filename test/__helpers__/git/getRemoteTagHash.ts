import { $ } from "execa";

export async function getRemoteTagHash(cwd: string, url: string, tag: string) {
  const { stdout } = await $({
    cwd,
    lines: true,
  })`git ls-remote --tags ${url} ${tag}`;

  return stdout.filter(Boolean).map((tag) => /^(?<tag>\S+)/.exec(tag)?.[1])[0];
}
