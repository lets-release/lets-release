import { LetsReleaseError } from "@lets-release/config";

import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";
import { PyPIPackageManager } from "src/types/PyPIPackageManager";

export class UnsupportedPyPIPackageManagerVersionError extends LetsReleaseError {
  get message() {
    return `Unsupported ${this.pm.name} version.`;
  }

  get details() {
    return `${this.pm.name} version ${this.versionRequirement} is required. Found ${this.currentVersion} for package ${this.pkg.project.name}.`;
  }

  constructor(
    private pkg: NormalizedPyProjectToml,
    private pm: PyPIPackageManager,
    private versionRequirement: string,
    private currentVersion: string,
  ) {
    super();
  }
}
