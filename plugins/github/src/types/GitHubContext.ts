import { LetsReleaseOctokit } from "src/LetsReleaseOctokit";
import { ResolvedGitHubOptions } from "src/schemas/GitHubOptions";

export interface GitHubContext {
  octokit: LetsReleaseOctokit;
  owner: string;
  repo: string;
  options: ResolvedGitHubOptions;
}
