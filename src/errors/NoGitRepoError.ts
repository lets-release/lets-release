import { LetsReleaseError } from "@lets-release/config";

import { name } from "src/program";

export class NoGitRepoError extends LetsReleaseError {
  get message() {
    return "Not running from a git repository.";
  }

  get details() {
    return `The \`${name}\` command must be executed from a Git repository.

The current working directory is \`${this.cwd}\`.

Please verify your CI configuration to make sure the \`${name}\` command is executed from the root of the cloned repository.`;
  }

  constructor(private cwd: string) {
    super();
  }
}
