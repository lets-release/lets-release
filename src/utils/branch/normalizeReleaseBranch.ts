import debug from "debug";

import {
  BranchType,
  Branches,
  Package,
  VersioningScheme,
} from "@lets-release/config";
import {
  compareSemVers,
  getEarliestSemVer,
  getLatestSemVer,
  increaseSemVer,
} from "@lets-release/semver";

import { name } from "src/program";
import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";

export function normalizeReleaseBranch<
  T extends BranchType.main | BranchType.next | BranchType.nextMajor =
    | BranchType.main
    | BranchType.next
    | BranchType.nextMajor,
>(
  packages: Package[],
  {
    type,
    branch,
    lowerSemVers,
    getFirstNextSemVer,
    getLowerBound,
    getUpperBound,
  }: {
    type: T;
    branch?: MatchBranchWithTags<T>;
    lowerSemVers?: Partial<Record<string, string>>;
    getFirstNextSemVer?: (pkg: Package) => string | undefined;
    getLowerBound?: (pkg: Package) => string | undefined;
    getUpperBound?: (latest: string) => string | undefined;
  },
): {
  branch?: Required<Branches>[T];
  latestSemVers: Partial<Record<string, string>>;
} {
  if (!branch) {
    return {
      latestSemVers: {},
    };
  }

  const latestSemVers = Object.fromEntries(
    packages.map(({ uniqueName, versioning }) => [
      uniqueName,
      versioning.scheme === VersioningScheme.SemVer
        ? getLatestSemVer(
            [
              ...(branch.tags[uniqueName]?.map(({ version }) => version) ?? []),
              ...(lowerSemVers?.[uniqueName] ? [lowerSemVers[uniqueName]] : []),
            ],
            versioning.prerelease,
          )
        : undefined,
    ]),
  );

  return {
    branch: {
      ...branch,
      type,
      ranges: Object.fromEntries(
        packages.map((pkg) => {
          if (pkg.versioning.scheme === VersioningScheme.CalVer) {
            return [pkg.uniqueName, undefined];
          }

          const latestSemVer = latestSemVers[pkg.uniqueName];
          const lowerBound =
            getLowerBound?.(pkg) ??
            (type === BranchType.main
              ? pkg.versioning.initialVersion
              : increaseSemVer(
                  "major",
                  pkg.versioning.initialVersion,
                  pkg.versioning.prerelease,
                ));
          const min = latestSemVer
            ? getLatestSemVer(
                [
                  increaseSemVer(
                    "patch",
                    latestSemVer,
                    pkg.versioning.prerelease,
                  ),
                  lowerBound,
                ],
                pkg.versioning.prerelease,
              )!
            : lowerBound;
          const firstNextSemVer = getFirstNextSemVer?.(pkg);

          if (
            firstNextSemVer &&
            compareSemVers(min, firstNextSemVer, pkg.versioning.prerelease) >= 0
          ) {
            debug(`${name}:utils.branch.normalizeReleaseBranch`)(
              `Invalid range for ${pkg.uniqueName} on branch ${branch.name}`,
            );

            return [pkg.uniqueName, undefined];
          }

          const upperBound = getUpperBound?.(min);
          const max =
            firstNextSemVer && upperBound
              ? getEarliestSemVer(
                  [firstNextSemVer, upperBound],
                  pkg.versioning.prerelease,
                )
              : (firstNextSemVer ?? upperBound);

          return [
            pkg.uniqueName,
            {
              min,
              max,
            },
          ];
        }),
      ),
    } as unknown as Required<Branches>[T],
    latestSemVers,
  };
}
