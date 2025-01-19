import { union } from "lodash-es";

import { compareCalVers } from "@lets-release/calver";
import { Package, VersioningScheme } from "@lets-release/config";
import { compareSemVers } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getAscendingVersions } from "src/utils/branch/getAscendingVersions";
import { getEarliestVersion } from "src/utils/branch/getEarliestVersion";
import { sortPackageVersions } from "src/utils/branch/sortPackageVersions";

export function getFirstVersion(
  pkg: Package,
  branch: Pick<MatchBranchWithTags, "tags">,
  {
    lowerBranches,
    withPrerelease,
  }: {
    lowerBranches?: Pick<MatchBranchWithTags, "tags">[];
    withPrerelease?: boolean;
  } = {},
) {
  const lowerVersions = sortPackageVersions(
    pkg,
    union(
      ...(lowerBranches?.map(
        ({ tags }) => tags[pkg.name]?.map(({ version }) => version) ?? [],
      ) ?? []),
    ),
    "desc",
  );

  if (lowerVersions[0]) {
    return getAscendingVersions(pkg, branch, { withPrerelease }).find(
      (version) =>
        (pkg?.versioning.scheme === VersioningScheme.CalVer
          ? compareCalVers(
              pkg.versioning.format,
              version,
              lowerVersions[0],
              pkg.versioning.prerelease,
            )
          : compareSemVers(
              version,
              lowerVersions[0],
              pkg.versioning.prerelease,
            )) > 0,
    );
  }

  return getEarliestVersion(pkg, branch, { withPrerelease });
}
