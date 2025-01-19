import { LetsReleaseError } from "@lets-release/config";

import { stringify } from "src/utils/stringify";

export class NoGitRepoPermissionError extends LetsReleaseError {
  get message() {
    return "Cannot push to the Git repository.";
  }

  get details() {
    return `**lets-release** cannot push the version tag to the branch \`${this.branch}\` on the remote Git repository with URL \`${this.repositoryUrl}\`.

This can be caused by:
- a misconfiguration of the repositoryUrl option
- the repository being unavailable
- or missing push permission for the user configured via the Git credentials on your CI environment

${stringify(this.error)}
`;
  }

  constructor(
    private repositoryUrl: string,
    private branch: string,
    private error: unknown,
  ) {
    super();
  }
}
