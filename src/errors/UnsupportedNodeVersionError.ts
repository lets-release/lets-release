import { LetsReleaseError } from "@lets-release/config";

export class UnsupportedNodeVersionError extends LetsReleaseError {
  get message() {
    return "Unsupported Node.js version.";
  }

  get details() {
    return `Node.js version \`${this.nodeVersionRequirement}\` is required. Found \`${this.currentNodeVersion}\`.`;
  }

  constructor(
    private nodeVersionRequirement: string,
    private currentNodeVersion: string,
  ) {
    super();
  }
}
