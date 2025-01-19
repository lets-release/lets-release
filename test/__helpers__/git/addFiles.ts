import { $ } from "execa";

export async function addFiles(cwd: string) {
  await $({ cwd })`git add .`;
}
