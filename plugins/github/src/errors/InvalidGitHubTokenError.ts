import { LetsReleaseError } from "@lets-release/config";

export class InvalidGitHubTokenError extends LetsReleaseError {
  message = "Invalid GitHub token.";

  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get details() {
    return `The [GitHub token][] configured in the \`GH_TOKEN\` or \`GITHUB_TOKEN\` environment variable must be a valid [personal token][] allowing to push to the repository ${this.owner}/${this.repo}.

Please make sure to set the \`GH_TOKEN\` or \`GITHUB_TOKEN\` environment variable in your CI with the exact value of the GitHub personal token.

[GitHub token]: https://github.com/lets-release/lets-release/tree/main/plugins/github/README.md#github-authentication
[personal token]: https://help.github.com/articles/creating-a-personal-access-token-for-the-command-line`;
  }
}
