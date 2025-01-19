import { LetsReleaseError } from "@lets-release/config";

export class NoGitHubTokenError extends LetsReleaseError {
  message = "No GitHub token specified.";

  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get details() {
    return `A [GitHub token][] must be created and set in the \`GH_TOKEN\` or \`GITHUB_TOKEN\` environment variable on your CI environment.

Please make sure to create a [GitHub personal token][] and to set it in the \`GH_TOKEN\` or \`GITHUB_TOKEN\` environment variable on your CI environment. The token must allow to push to the repository ${this.owner}/${this.repo}.

[GitHub token]: https://github.com/lets-release/lets-release/tree/main/plugins/github/README.md#github-authentication
[GitHub personal token]: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line`;
  }
}
