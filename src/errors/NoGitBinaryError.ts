import { LetsReleaseError } from "@lets-release/config";

export class NoGitBinaryError extends LetsReleaseError {
  get message() {
    return "No git binary found.";
  }

  get details() {
    return `Git version ${this.gitVersionRequirement} is required. No git binary found.`;
  }

  constructor(private gitVersionRequirement: string) {
    super();
  }
}
