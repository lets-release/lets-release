import { paginate } from "@lets-release/git-host";

import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { PullRequest } from "src/types/PullRequest";

export async function filterPullRequest(
  octokit: LetsReleaseOctokit,
  owner: string,
  repo: string,
  shas: string[],
  { number }: PullRequest,
) {
  const commits = await paginate(async (page) => {
    const items = await octokit.paginate(
      "GET /repos/{owner}/{repo}/pulls/{pull_number}/commits",
      {
        owner,
        repo,
        pull_number: number,
        per_page: 100,
        page,
      },
    );

    return {
      items,
      hasNextPage: items.length === 100,
    };
  });

  if (commits.some(({ sha }) => shas.includes(sha))) {
    return true;
  }

  const {
    data: { merge_commit_sha },
  } = await octokit.request("GET /repos/{owner}/{repo}/pulls/{pull_number}", {
    owner,
    repo,
    pull_number: number,
  });

  return !!merge_commit_sha && shas.includes(merge_commit_sha);
}
