import { LetsReleaseError } from "@lets-release/config";

export class UnsupportedNpmPackageManagerError extends LetsReleaseError {
  message = "Unsupported npm package manager";

  constructor(private pkg: string) {
    super();
  }

  get details() {
    return `The package manager for \`${this.pkg}\` is not supported.

Supported package managers are: npm, pnpm, and yarn.`;
  }
}
