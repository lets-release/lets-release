import { $ } from "execa";

import { getHeadHash } from "src/utils/git/getHeadHash";

export async function commit(cwd: string, message: string) {
  await $({
    cwd,
  })`git commit -m ${message} --allow-empty --no-gpg-sign`;

  return await getHeadHash({ cwd });
}
