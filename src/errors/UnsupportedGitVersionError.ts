import { LetsReleaseError } from "@lets-release/config";

export class UnsupportedGitVersionError extends LetsReleaseError {
  get message() {
    return "Unsupported Git version.";
  }

  get details() {
    return `Git version ${this.gitVersionRequirement} is required. Found ${this.currentGitVersion}.`;
  }

  constructor(
    private gitVersionRequirement: string,
    private currentGitVersion: string,
  ) {
    super();
  }
}
