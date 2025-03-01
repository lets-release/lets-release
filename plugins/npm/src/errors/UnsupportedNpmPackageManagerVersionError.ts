import { NormalizedPackageJson } from "read-pkg";

import { LetsReleaseError } from "@lets-release/config";

import { NpmPackageManager } from "src/types/NpmPackageManager";

export class UnsupportedNpmPackageManagerVersionError extends LetsReleaseError {
  get message() {
    return `Unsupported ${this.pm.name} version.`;
  }

  get details() {
    return `${this.pm.name} version ${this.versionRequirement} is required. Found ${this.currentVersion} for package ${this.pkg.name}.`;
  }

  constructor(
    private pkg: NormalizedPackageJson,
    private pm: NpmPackageManager,
    private versionRequirement: string,
    private currentVersion: string,
  ) {
    super();
  }
}
