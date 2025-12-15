import { compareCalVers, reverseCompareCalVers } from "@lets-release/calver";
import { Package, VersionTag, VersioningScheme } from "@lets-release/config";
import { compareSemVers, reverseCompareSemVers } from "@lets-release/semver";

export function sortPackageVersions<T extends string | VersionTag>(
  pkg: Package,
  versions: T[],
  direction: "asc" | "desc" = "asc",
) {
  return versions.toSorted((a, b) =>
    pkg.versioning.scheme === VersioningScheme.CalVer
      ? { asc: compareCalVers, desc: reverseCompareCalVers }[direction](
          pkg.versioning.format,
          typeof a === "string" ? a : a.version,
          typeof b === "string" ? b : b.version,
        )
      : { asc: compareSemVers, desc: reverseCompareSemVers }[direction](
          typeof a === "string" ? a : a.version,
          typeof b === "string" ? b : b.version,
        ),
  );
}
