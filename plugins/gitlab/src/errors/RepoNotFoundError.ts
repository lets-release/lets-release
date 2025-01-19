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
    return `The **lets-release** \`repositoryUrl\` option must refer to your GitLab repository. The repository must be accessible with the [GitLab API][].

By default the \`repositoryUrl\` option is retrieved from the \`repository\` property of your \`package.json\` or the [git origin url][] of the repository cloned by your CI environment.

[GitLab API]: https://docs.gitlab.com/ce/api/README.html
[git origin url]: https://git-scm.com/book/en/v2/Git-Basics-Working-with-Remotes
[GitLab Enterprise Edition]: https://about.gitlab.com/gitlab-ee
[options]: https://gitlab.com/lets-release/lets-release/tree/main/plugins/gitlab/README.md#options`;
  }
}
