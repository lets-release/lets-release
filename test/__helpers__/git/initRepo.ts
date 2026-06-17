import { $ } from "execa";
import { temporaryDirectory } from "tempy";

// eslint-disable-next-line unicorn/consistent-boolean-name
export async function initRepo(bare?: boolean) {
  const cwd = temporaryDirectory();

  await $({ cwd })`git init --initial-branch=main ${bare ? ["--bare"] : []}`;

  return cwd;
}
