import fileUrl from "file-url";

import { initRepo } from "test/__helpers__/git/initRepo";

export async function initRepoAsRemote() {
  const cwd = await initRepo(true);

  return fileUrl(cwd);
}
