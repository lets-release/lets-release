import { $ } from "execa";
import { temporaryDirectory } from "tempy";

export async function initRepoAndCheckoutRemoteHead(url: string, head: string) {
  const cwd = temporaryDirectory();

  await $({ cwd })`git init`;
  await $({ cwd })`git remote add origin ${url}`;
  await $({ cwd })`git fetch ${url}`;
  await $({ cwd })`git checkout ${head}`;

  return cwd;
}
