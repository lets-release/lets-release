import { $ } from "execa";

export async function mergeBranch(cwd: string, ref: string, ff?: boolean) {
  await $({ cwd })`git merge ${ff ? "--ff" : "--no-ff"} ${ref}`;
}
