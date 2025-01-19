import { LetsReleaseError } from "@lets-release/config";

export class NoGitLabPullPermissionError extends LetsReleaseError {
  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get message() {
    return `The GitLab token doesn't allow to pull from the repository ${this.owner}/${this.repo}.`;
  }

  get details() {
    return `The user associated with the [GitLab token][] configured in the \`GL_TOKEN\` or \`GITLAB_TOKEN\` environment variable must allows to pull from the repository ${this.owner}/${this.repo}.

Please make sure the GitLab user associated with the token has the [permission to pull][] from the repository ${this.owner}/${this.repo}.

[GitLab token]: https://gitlab.com/lets-release/lets-release/tree/main/plugins/gitlab/README.md#gitlab-authentication
[permission to pull]: https://docs.gitlab.com/ee/user/permissions.html#project-members-permissions`;
  }
}
