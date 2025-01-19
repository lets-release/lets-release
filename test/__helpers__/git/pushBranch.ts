import { $ } from "execa";

export async function pushBranch(cwd: string, url: string, branch: string) {
  await $({
    cwd,
  })`git push ${url} ${`HEAD:${branch}`} --tags`;
}
