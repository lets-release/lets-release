import { $ } from "execa";

export async function addTag(cwd: string, tag: string) {
  await $({ cwd })`git tag ${tag}`;
}
