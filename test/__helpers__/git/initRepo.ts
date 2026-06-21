import { $ } from "execa";
import { temporaryDirectory } from "tempy";

export async function initRepo(bare?: boolean) {
  const cwd = temporaryDirectory();

  await $({ cwd })`git init --initial-branch=main ${bare ? ["--bare"] : []}`;

  return cwd;
}
