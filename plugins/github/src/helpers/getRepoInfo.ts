import { parseGitHubUrl } from "src/helpers/parseGitHubUrl";
import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";

export async function getRepoInfo(octokit: LetsReleaseOctokit, url: string) {
  const {
    data: { full_name },
  } = await octokit.request("GET /repos/{owner}/{repo}", parseGitHubUrl(url));

  const [owner, repo] = full_name.split("/");

  return { owner, repo };
}
