import { $, Options } from "execa";

import { getHeadName } from "src/utils/git/getHeadName";

/**
 * Fetch all the tags from a branch. Unshallow if necessary.
 * This will update the local branch from the latest on the remote if:
 * - The branch is not the one that triggered the CI
 * - The CI created a detached head
 *
 * Otherwise it just calls `git fetch` without specifying the `refspec` option to avoid overwriting the head commit set by the CI.
 *
 * The goal is to retrieve the information on all the release branches without "disturbing" the CI, leaving the trigger branch or the detached head intact.
 *
 * @param repositoryUrl The remote repository url.
 * @param branch The repository branch to fetch.
 * @param ciBranch The ci branch.
 * @param options Options to pass to `execa`.
 */
export async function fetchBranchTags(
  repositoryUrl: string,
  branch: string,
  ciBranch?: string,
  options: Partial<Options> = {},
) {
  const head = await getHeadName(options);
  const isDetachedHead = head === "HEAD";
  const args =
    branch === ciBranch && !isDetachedHead
      ? [repositoryUrl, branch]
      : [
          "--update-head-ok",
          repositoryUrl,
          `+refs/heads/${branch}:refs/heads/${branch}`,
        ];

  try {
    await $(options)`git fetch --unshallow --tags ${args}`;
  } catch {
    await $(options)`git fetch --tags ${args}`;
  }
}
