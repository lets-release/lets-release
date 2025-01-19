import { LetsReleaseError } from "@lets-release/config";

export class NoGitLabTokenError extends LetsReleaseError {
  message = "No GitLab token specified.";

  constructor(
    private owner: string,
    private repo: string,
  ) {
    super();
  }

  get details() {
    return `A [GitLab token][] must be created and set in the \`GL_TOKEN\` or \`GITLAB_TOKEN\` environment variable on your CI environment.

Please make sure to create a [GitLab personal access token][] and to set it in the \`GL_TOKEN\` or \`GITLAB_TOKEN\` environment variable on your CI environment. The token must allow to push to the repository ${this.owner}/${this.repo}.

[GitLab token]: https://gitlab.com/lets-release/lets-release/tree/main/plugins/gitlab/README.md#gitlab-authentication
[GitLab personal access token]: https://docs.gitlab.com/ce/user/profile/personal_access_tokens.html`;
  }
}
