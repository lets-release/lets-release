import { $ } from "execa";
import { temporaryDirectory } from "tempy";

export async function cloneRepo(url: string, branch?: string, depth?: number) {
  const cwd = temporaryDirectory();

  await $`git clone --no-hardlinks ${branch ? ["-b", branch] : []} ${typeof depth === "number" ? ["--depth", depth] : []} ${url} ${cwd}`;

  return cwd;
}
