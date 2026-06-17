import { $ } from "execa";

// eslint-disable-next-line unicorn/consistent-boolean-name
export async function mergeBranch(cwd: string, ref: string, ff?: boolean) {
  await $({ cwd })`git merge ${ff ? "--ff" : "--no-ff"} ${ref}`;
}
