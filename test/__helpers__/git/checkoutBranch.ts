import { $ } from "execa";

export async function checkoutBranch(
  cwd: string,
  branch: string,
  startPoint?: string,
) {
  try {
    await $({
      cwd,
    })`git checkout -b ${branch} ${startPoint ?? []}`;
  } catch {
    await $({
      cwd,
    })`git checkout ${branch}`;
  }
}
