import { $, Options } from "execa";

export async function pushBranch(
  repositoryUrl: string,
  branch: string,
  options: Partial<Options> = {},
) {
  await $(options)`git push ${repositoryUrl} ${`HEAD:${branch}`}`;
}
