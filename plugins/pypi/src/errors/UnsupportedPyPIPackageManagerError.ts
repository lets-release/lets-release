import { LetsReleaseError } from "@lets-release/config";

export class UnsupportedPyPIPackageManagerError extends LetsReleaseError {
  message = "Unsupported PyPI package manager";

  constructor(private pkg: string) {
    super();
  }

  get details() {
    return `The package manager for \`${this.pkg}\` is not supported.

Supported package managers are: uv, and poetry.`;
  }
}
