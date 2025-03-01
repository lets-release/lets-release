import { NormalizedPackageJson } from "read-pkg";

import { LetsReleaseError } from "@lets-release/config";

import { NpmPackageManager } from "src/types/NpmPackageManager";

export class NoNpmPackageManagerBinaryError extends LetsReleaseError {
  get message() {
    return `No ${this.pm.name} binary found.`;
  }

  get details() {
    return `${this.pm.name} version ${this.versionRequirement} is required. No ${this.pm.name} binary found for package ${this.pkg.name}.`;
  }

  constructor(
    private pkg: NormalizedPackageJson,
    private pm: NpmPackageManager,
    private versionRequirement: string,
  ) {
    super();
  }
}
