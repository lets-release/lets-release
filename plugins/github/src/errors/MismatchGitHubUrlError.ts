import { LetsReleaseError } from "@lets-release/config";

export class MismatchGitHubUrlError extends LetsReleaseError {
  message = "The git repository URL mismatches the GitHub URL.";

  constructor(
    private repositoryUrl: string,
    private cloneUrl: string,
  ) {
    super();
  }

  get details() {
    return `The **lets-release** \`repositoryUrl\` option must have the same repository name and owner as the GitHub repo.

Your configuration for the \`repositoryUrl\` option is \`${this.repositoryUrl}\` and the \`clone_url\` of your GitHub repo is \`${this.cloneUrl}\`.

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url][] of the repository cloned by your CI environment.

Note: If you have recently changed your GitHub repository name or owner, update the value in **lets-release** \`repositoryUrl\` option and the \`repository\` property of your \`package.json\` respectively to match the new GitHub URL.

[git origin url]: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes`;
  }
}
