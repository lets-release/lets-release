import { LetsReleaseError } from "@lets-release/config";

import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";
import { PyPIPackageManager } from "src/types/PyPIPackageManager";

export class NoPyPIPackageManagerBinaryError extends LetsReleaseError {
  get message() {
    return `No ${this.pm.name} binary found.`;
  }

  get details() {
    return `${this.pm.name} version ${this.versionRequirement} is required. No ${this.pm.name} binary found for package ${this.pkg.project.name}.`;
  }

  constructor(
    private pkg: NormalizedPyProjectToml,
    private pm: PyPIPackageManager,
    private versionRequirement: string,
  ) {
    super();
  }
}
