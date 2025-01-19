import { compareCalVers } from "@lets-release/calver";
import {
  MaintenanceVersionRange,
  Package,
  VersioningScheme,
} from "@lets-release/config";
import { compareSemVers } from "@lets-release/semver";

export function verifyMaintenanceMergeRange(
  pkg: Package,
  { mergeMin, mergeMax }: MaintenanceVersionRange,
  version: string,
) {
  if (pkg.versioning.scheme === VersioningScheme.CalVer) {
    return (
      compareCalVers(
        pkg.versioning.format,
        version,
        mergeMin,
        pkg.versioning.prerelease,
      ) >= 0 &&
      compareCalVers(
        pkg.versioning.format,
        version,
        mergeMax,
        pkg.versioning.prerelease,
      ) < 0
    );
  }

  return (
    compareSemVers(version, mergeMin, pkg.versioning.prerelease) >= 0 &&
    compareSemVers(version, mergeMax, pkg.versioning.prerelease) < 0
  );
}
