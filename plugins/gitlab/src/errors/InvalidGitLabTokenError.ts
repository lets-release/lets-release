import { LetsReleaseError } from "@lets-release/config";

export class InvalidGitLabTokenError extends LetsReleaseError {
  message = "Invalid GitLab token.";

  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get details() {
    return `The [GitLab token][] configured in the \`GL_TOKEN\` or \`GITLAB_TOKEN\` environment variable must be a valid [personal access token][] allowing to push to the repository ${this.owner}/${this.repo}.

Please make sure to set the \`GL_TOKEN\` or \`GITLAB_TOKEN\` environment variable in your CI with the exact value of the GitLab personal token.

[GitLab token]: https://gitlab.com/lets-release/lets-release/tree/main/plugins/gitlab/README.md#gitlab-authentication
[personal access token]: https://docs.gitlab.com/ce/user/profile/personal_access_tokens.html`;
  }
}
