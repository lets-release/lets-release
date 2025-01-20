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
      packages.map(({ name, versioning }) => {
        if (!ranges[name]) {
          return [name, undefined];
        }

        if (versioning.scheme === VersioningScheme.CalVer) {
          return [name, parseCalVerXRange(versioning.format, ranges[name])];
        }

        return [name, parseSemVerXRange(ranges[name])];
      }),
    ),
  }));
  const packageBranches = Object.fromEntries(
    packages.map((pkg) => [
      pkg.name,
      mappedBranches
        .filter(
          (
            branch,
          ): branch is Omit<MatchMaintenanceBranch, "ranges"> &
            Pick<BaseBranch, "tags"> & {
              ranges: Record<string, ParsedCalVerXRange | ParsedSemVerXRange>;
            } => !!branch.ranges?.[pkg.name],
        )
        .sort((a, b) => {
          if (pkg.versioning.scheme === VersioningScheme.CalVer) {
            return compareCalVers(
              pkg.versioning.format,
              a.ranges[pkg.name].max,
              b.ranges[pkg.name].max,
              pkg.versioning.prerelease,
            );
          }

          return compareSemVers(
            a.ranges[pkg.name].max,
            b.ranges[pkg.name].max,
            pkg.versioning.prerelease,
          );
        })
        .reduce(
          (branches, { ranges, ...rest }) => {
            const range = ranges[pkg.name];
            const lowerRange = branches.at(-1)?.ranges[pkg.name];

            if (
              lowerRange &&
              lowerRange.min === range.min &&
              lowerRange.max === range.max
            ) {
              debug(namespace)(
                `Conflict maintenance range for ${pkg.name} on ${rest.name} and ${branches.at(-1)?.name}`,
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
        if (!ranges[pkg.name]) {
          return [pkg.name, undefined];
        }

        const branches = packageBranches[pkg.name];

        if (branches.length === 0) {
          return [pkg.name, undefined];
        }

        const index = branches.findIndex((branch) => branch.name === name);

        if (index === -1) {
          return [pkg.name, undefined];
        }

        const range = branches[index]?.ranges[pkg.name];
        const lowerRange = branches[index - 1]?.ranges?.[pkg.name];
        const versions = tags[pkg.name]?.map(({ version }) => version) ?? [];

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
          const max = getEarliestCalVer(
            pkg.versioning.format,
            [...(base ? [base] : []), range.max],
            pkg.versioning.prerelease,
          );

          const latestCalVer = getLatestCalVer(
            pkg.versioning.format,
            versions,
            { ...pkg.versioning.prerelease, before: max },
          );
          const nextCalVer = latestCalVer
            ? increaseCalVer(
                "micro",
                pkg.versioning.format,
                latestCalVer,
                pkg.versioning.prerelease,
              )
            : mergeMin;

          // The actual lower bound is the highest version between the current branch last release and `mergeMin`
          const min = getLatestCalVer(
            pkg.versioning.format,
            [nextCalVer, mergeMin],
            pkg.versioning.prerelease,
          )!;

          if (
            base &&
            compareCalVers(
              pkg.versioning.format,
              min,
              base,
              pkg.versioning.prerelease,
            ) >= 0
          ) {
            debug(namespace)(
              `Invalid maintenance range for ${pkg.name} on branch ${name}`,
            );

            return [pkg.name, undefined];
          }

          return [
            pkg.name,
            {
              min,
              max,
              mergeMin,
              mergeMax: range.max,
            },
          ];
        } else {
          // The max is the lowest version between the `base` version and the upper bound of the current branch range
          const max = getEarliestSemVer(
            [...(base ? [base] : []), range.max],
            pkg.versioning.prerelease,
          );

          const latestSemVer = getLatestSemVer(versions, {
            ...pkg.versioning.prerelease,
            before: max,
          });
          const nextSemVer = latestSemVer
            ? increaseSemVer("patch", latestSemVer, pkg.versioning.prerelease)
            : mergeMin;

          // The actual lower bound is the highest version between the current branch last release and `mergeMin`
          const min = getLatestSemVer(
            [nextSemVer, mergeMin],
            pkg.versioning.prerelease,
          )!;

          if (
            compareSemVers(
              min,
              base ?? pkg.versioning.initialVersion,
              pkg.versioning.prerelease,
            ) >= 0
          ) {
            debug(namespace)(
              `Invalid maintenance range for ${pkg.name} on branch ${name}`,
            );

            return [pkg.name, undefined];
          }

          return [
            pkg.name,
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
