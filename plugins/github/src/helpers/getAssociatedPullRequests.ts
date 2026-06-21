import { generateGetBatchCommitsQuery } from "src/helpers/generateGetBatchCommitsQuery";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { getCommitQuery } from "src/queries/getCommitQuery";
import { Commit } from "src/types/Commit";

export async function getAssociatedPullRequests(
  octokit: LetsReleaseOctokit,
  owner: string,
  repo: string,
  shas: string[],
) {
  const responsePRs = [];

  const { repository } = await octokit.graphql<{
    repository: Record<string, Commit>;
  }>(generateGetBatchCommitsQuery(shas), { owner, repo });

  for (const {
    oid,
    associatedPullRequests: { nodes, pageInfo },
  } of Object.values(repository)) {
    if (nodes.length === 0) {
      continue;
    }

    responsePRs.push(nodes);

    let cursor = pageInfo.endCursor;
    let hasNextPage = pageInfo.hasNextPage;

    while (hasNextPage) {
      const {
        repository: {
          commit: {
            associatedPullRequests: { nodes, pageInfo },
          },
        },
      } = await octokit.graphql<{
        repository: { commit: Commit };
      }>(getCommitQuery, {
        owner,
        repo,
        sha: oid,
        cursor,
      });

      responsePRs.push(nodes);

      if (pageInfo.hasNextPage) {
        cursor = pageInfo.endCursor;
      } else {
        hasNextPage = false;
      }
    }
  }

  return responsePRs;
}
