import { $, Options } from "execa";

export async function pushBranch(
  repositoryUrl: string,
  branch: string,
  options: Options = {},
) {
  await $(options)`git push ${repositoryUrl} ${`HEAD:${branch}`}`;
}
