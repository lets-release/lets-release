import { LetsReleaseError } from "@lets-release/config";

export class RepoNotFoundError extends LetsReleaseError {
  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get message() {
    return `The repository ${this.owner}/${this.repo} doesn't exist.`;
  }

  get details() {
    return `The **lets-release** \`repositoryUrl\` option must refer to your GitHub repository. The repository must be accessible with the [GitHub API][].

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url][] of the repository cloned by your CI environment.

If you are using [GitHub Enterprise][] please make sure to configure the \`apiUrl\` [options][].

[GitHub API]: https://developer.github.com/v3
[git origin url]: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
[GitHub Enterprise]: https://enterprise.github.com
[options]: https://github.com/lets-release/lets-release/tree/main/plugins/github/README.md#options`;
  }
}
