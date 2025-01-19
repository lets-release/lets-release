import { $ } from "execa";

export async function rebaseBranch(cwd: string, ref: string) {
  await $({ cwd })`git rebase ${ref}`;
}
