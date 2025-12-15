import debug from "debug";

import {
  ParsedCalVerXRange,
  compareCalVers,
  getEarliestCalVer,
  getLatestCalVer,
  increaseCalVer,
  parseCalVerXRange,
} from "@lets-release/calver";
import {
  BaseBranch,
  BranchType,
  MaintenanceBranch,
  Package,
  VersioningScheme,
} from "@lets-release/config";
import {
  ParsedSemVerXRange,
  compareSemVers,
  getEarliestSemVer,
  getLatestSemVer,
  increaseSemVer,
  parseSemVerXRange,
} from "@lets-release/semver";

import { name } from "src/program";
import { MatchMaintenanceBranch } from "src/types/MatchBranch";
import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getFirstVersion } from "src/utils/branch/getFirstVersion";
import { getLatestVersion } from "src/utils/branch/getLatestVersion";

const namespace = `${name}:utils.branch.normalizeMaintenanceBranches`;

export function normalizeMaintenanceBranches(
  packages: Package[],
  mainBranch?: MatchBranchWithTags<BranchType.main>,
  maintenanceBranches: MatchBranchWithTags<BranchType.maintenance>[] = [],
): MaintenanceBranch[] | undefined {
  const mappedBranches = maintenanceBranches.map(({ ranges, ...rest }) => ({
    ...rest,
    ranges: Object.fromEntries<
      ParsedCalVerXRange | ParsedSemVerXRange | undefined
    >(
      packages.map(({ uniqueName, versioning }) => {
        if (!ranges[uniqueName]) {
          return [uniqueName, undefined];
        }

        if (versioning.scheme === VersioningScheme.CalVer) {
          return [
            uniqueName,
            parseCalVerXRange(versioning.format, ranges[uniqueName]),
          ];
        }

        return [uniqueName, parseSemVerXRange(ranges[uniqueName])];
      }),
    ),
  }));
  const packageBranches = Object.fromEntries(
    packages.map((pkg) => [
      pkg.uniqueName,
      mappedBranches
        .filter(
          (
            branch,
          ): branch is Omit<MatchMaintenanceBranch, "ranges"> &
            Pick<BaseBranch, "tags"> & {
              ranges: Record<string, ParsedCalVerXRange | ParsedSemVerXRange>;
            } => !!branch.ranges?.[pkg.uniqueName],
        )
        .toSorted((a, b) => {
          if (pkg.versioning.scheme === VersioningScheme.CalVer) {
            return compareCalVers(
              pkg.versioning.format,
              a.ranges[pkg.uniqueName].max,
              b.ranges[pkg.uniqueName].max,
            );
          }

          return compareSemVers(
            a.ranges[pkg.uniqueName].max,
            b.ranges[pkg.uniqueName].max,
          );
        })
        .reduce(
          (branches, { ranges, ...rest }) => {
            const range = ranges[pkg.uniqueName];
            const lowerRange = branches.at(-1)?.ranges[pkg.uniqueName];

            if (
              lowerRange &&
              lowerRange.min === range.min &&
              lowerRange.max === range.max
            ) {
              debug(namespace)(
                `Conflict maintenance range for ${pkg.uniqueName} on ${rest.name} and ${branches.at(-1)?.name}`,
              );

              return branches.slice(0, -1);
            }

            return [...branches, { ranges, ...rest }];
          },
          [] as (Omit<MatchMaintenanceBranch, "ranges"> &
            Pick<BaseBranch, "tags"> & {
              ranges: Record<string, ParsedCalVerXRange | ParsedSemVerXRange>;
            })[],
        ),
    ]),
  );

  return mappedBranches?.map(({ name, tags, ranges, ...rest }) => ({
    ...rest,
    type: BranchType.maintenance,
    name,
    tags,
    ranges: Object.fromEntries(
      packages.map((pkg) => {
        if (!ranges[pkg.uniqueName]) {
          return [pkg.uniqueName, undefined];
        }

        const branches = packageBranches[pkg.uniqueName];

        if (branches.length === 0) {
          return [pkg.uniqueName, undefined];
        }

        const index = branches.findIndex((branch) => branch.name === name);

        if (index === -1) {
          return [pkg.uniqueName, undefined];
        }

        const range = branches[index]?.ranges[pkg.uniqueName];
        const lowerRange = branches[index - 1]?.ranges?.[pkg.uniqueName];
        const versions =
          tags[pkg.uniqueName]?.map(({ version }) => version) ?? [];

        // Find the lower bound based on Maintenance branches
        const mergeMin =
          // If the current branch has a major range (1.x or 1.x.x) and the previous doesn't
          "minor" in range &&
          range.minor === "*" &&
          lowerRange &&
          "minor" in lowerRange &&
          lowerRange.minor !== "*"
            ? // Then the lowest bound is the upper bound of the previous branch range
              lowerRange.max
            : // Otherwise the lowest bound is the lowest bound of the current branch range
              range.min;

        // Determine the first release of the default branch not present in any maintenance branch
        const base = mainBranch
          ? (getFirstVersion(pkg, mainBranch, {
              lowerBranches: branches,
            }) ?? getLatestVersion(pkg, mainBranch))
          : undefined;

        if (pkg.versioning.scheme === VersioningScheme.CalVer) {
          // The max is the lowest version between the `base` version and the upper bound of the current branch range
          const max = getEarliestCalVer(pkg.versioning.format, [
            ...(base ? [base] : []),
            range.max,
          ]);

          const latestCalVer = getLatestCalVer(
            pkg.versioning.format,
            versions,
            { ...pkg.versioning.prerelease, before: max },
          );
          const nextCalVer = latestCalVer
            ? increaseCalVer(
                "patch:maintenance",
                pkg.versioning.format,
                latestCalVer,
                pkg.versioning.prerelease,
              )
            : mergeMin;

          // The actual lower bound is the highest version between the current branch last release and `mergeMin`
          const min = getLatestCalVer(pkg.versioning.format, [
            nextCalVer,
            mergeMin,
          ])!;

          if (base && compareCalVers(pkg.versioning.format, min, base) >= 0) {
            debug(namespace)(
              `Invalid maintenance range for ${pkg.uniqueName} on branch ${name}`,
            );

            return [pkg.uniqueName, undefined];
          }

          return [
            pkg.uniqueName,
            {
              min,
              max,
              mergeMin,
              mergeMax: range.max,
            },
          ];
        } else {
          // The max is the lowest version between the `base` version and the upper bound of the current branch range
          const max = getEarliestSemVer([...(base ? [base] : []), range.max]);

          const latestSemVer = getLatestSemVer(versions, {
            ...pkg.versioning.prerelease,
            before: max,
          });
          const nextSemVer = latestSemVer
            ? increaseSemVer("patch", latestSemVer, pkg.versioning.prerelease)
            : mergeMin;

          // The actual lower bound is the highest version between the current branch last release and `mergeMin`
          const min = getLatestSemVer([nextSemVer, mergeMin])!;

          if (compareSemVers(min, base ?? pkg.versioning.initialVersion) >= 0) {
            debug(namespace)(
              `Invalid maintenance range for ${pkg.uniqueName} on branch ${name}`,
            );

            return [pkg.uniqueName, undefined];
          }

          return [
            pkg.uniqueName,
            {
              min,
              max,
              mergeMin,
              mergeMax: range.max,
            },
          ];
        }
      }),
    ),
  }));
}
