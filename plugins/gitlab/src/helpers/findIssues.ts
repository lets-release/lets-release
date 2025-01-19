import { AllIssuesOptions, Gitlab } from "@gitbeaker/core";

import { paginate } from "@lets-release/git-host";

export async function findIssues(
  gitlab: Gitlab,
  projectId: string,
  options: AllIssuesOptions & {
    withLabelsDetails?: false;
  },
) {
  return await paginate(async (page) => {
    const items = await gitlab.Issues.all({
      ...options,
      projectId,
      perPage: 100,
      page,
    });

    return {
      items,
      hasNextPage: items.length === 100,
    };
  });
}
