import { Gitlab } from "@gitbeaker/core";

import { paginate } from "@lets-release/git-host";

export async function getAssociatedMergeRequests(
  gitlab: Gitlab,
  projectId: string,
  hash: string,
) {
  const mergeRequests = await paginate(async (page) => {
    const items = await gitlab.Commits.allMergeRequests(projectId, hash, {
      perPage: 100,
      page,
    });

    return {
      items,
      hasNextPage: items.length === 100,
    };
  });

  return mergeRequests.filter((x) => x.state === "merged");
}
