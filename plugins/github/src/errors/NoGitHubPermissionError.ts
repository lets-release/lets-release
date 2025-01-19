import { LetsReleaseError } from "@lets-release/config";

export class NoGitHubPermissionError extends LetsReleaseError {
  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get message() {
    return `The GitHub token doesn't allow to push on the repository ${this.owner}/${this.repo}.`;
  }

  get details() {
    return `The user associated with the [GitHub token][] configured in the \`GH_TOKEN\` or \`GITHUB_TOKEN\` environment variable must allows to push to the repository ${this.owner}/${this.repo}.

Please make sure the GitHub user associated with the token is an [owner][] or a [collaborator][] if the repository belong to a user account or has [write permissions][] if the repository [belongs to an organization][].

[GitHub token]: https://github.com/lets-release/lets-release/tree/main/plugins/github/README.md#github-authentication
[owner]: https://help.github.com/articles/permission-levels-for-a-user-account-repository/#owner-access-on-a-repository-owned-by-a-user-account
[collaborator]: https://help.github.com/articles/permission-levels-for-a-user-account-repository/#collaborator-access-on-a-repository-owned-by-a-user-account
[write permissions]: https://help.github.com/articles/managing-team-access-to-an-organization-repository
[belongs to an organization]: https://help.github.com/articles/repository-permission-levels-for-an-organization`;
  }
}
