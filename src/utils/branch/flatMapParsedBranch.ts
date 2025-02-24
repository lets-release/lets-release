import { isValidCalVerXRange } from "@lets-release/calver";
import {
  BranchObject,
  BranchType,
  MaintenanceBranchObject,
  Package,
  PrereleaseBranchObject,
  ReleaseBranchObject,
  VersioningScheme,
} from "@lets-release/config";
import { isValidSemVerXRange } from "@lets-release/semver";

import { MatchBranch } from "src/types/MatchBranch";
import { ParsedBranch } from "src/types/ParsedBranch";
import { normalizeChannels } from "src/utils/branch/normalizeChannels";
import { normalizePrereleaseOptions } from "src/utils/branch/normalizePrereleaseOptions";

export function flatMapParsedBranch<T extends BranchType>(
  packages: Package[],
  type: T,
  branch: BranchObject<T>,
  { name, package: pkgName, range }: ParsedBranch,
): MatchBranch<T>[] {
  const { channels, prereleases } = branch as ReleaseBranchObject;
  const { ranges } = branch as MaintenanceBranchObject;
  const { prerelease } = branch as PrereleaseBranchObject;

  if (type === BranchType.prerelease) {
    const normalizedPrerelease = normalizePrereleaseOptions(name, prerelease);

    return normalizedPrerelease
      ? [
          {
            type,
            name,
            prerelease: normalizedPrerelease,
          } as unknown as MatchBranch<T>,
        ]
      : [];
  }

  const normalizedChannels = normalizeChannels(
    name,
    type === BranchType.main ? [null] : [name],
    channels,
  );
  const normalizedPrereleases = prereleases
    ? Object.fromEntries(
        Object.entries(prereleases).map(([key, options]) => [
          key,
          normalizePrereleaseOptions(key, options),
        ]),
      )
    : undefined;

  if (type !== BranchType.maintenance) {
    return [
      {
        type,
        name,
        channels: normalizedChannels,
        prereleases: normalizedPrereleases,
      } as unknown as MatchBranch<T>,
    ];
  }

  const branchPkgName =
    pkgName ?? packages.find(({ main }) => main)?.uniqueName;
  const rangeEntries = Object.entries(
    ranges ?? (branchPkgName && range ? { [branchPkgName]: range } : {}),
  ).filter(([pkgName, range]) => {
    const pkg = packages.find(({ uniqueName }) => uniqueName === pkgName);

    if (!pkg || !range) {
      return false;
    }

    if (pkg.versioning.scheme === VersioningScheme.SemVer) {
      return isValidSemVerXRange(range);
    }

    if (pkg.versioning.scheme === VersioningScheme.CalVer) {
      return isValidCalVerXRange(pkg.versioning.format, range);
    }
  });

  return rangeEntries.length === 0
    ? []
    : [
        {
          type,
          name,
          channels: normalizedChannels,
          prereleases: normalizedPrereleases,
          ranges: Object.fromEntries(rangeEntries),
        } as unknown as MatchBranch<T>,
      ];
}
