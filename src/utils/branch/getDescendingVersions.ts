import { isValidPrereleaseCalVer } from "@lets-release/calver";
import { Package, VersioningScheme } from "@lets-release/config";
import { isValidPrereleaseSemVer } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { sortPackageVersions } from "src/utils/branch/sortPackageVersions";

export function getDescendingVersions(
  pkg: Package,
  branch: Pick<MatchBranchWithTags, "tags">,
  { withPrerelease }: { withPrerelease?: boolean } = {},
) {
  const tags = branch.tags[pkg.uniqueName];

  if (!tags) {
    return [];
  }

  return sortPackageVersions(
    pkg,
    tags.filter(({ version }) => {
      if (withPrerelease) {
        return true;
      }

      return pkg.versioning.scheme === VersioningScheme.CalVer
        ? !isValidPrereleaseCalVer(
            pkg.versioning.format,
            version,
            pkg.versioning.prerelease,
          )
        : !isValidPrereleaseSemVer(version, pkg.versioning.prerelease);
    }),
    "desc",
  ).map(({ version }) => version);
}
