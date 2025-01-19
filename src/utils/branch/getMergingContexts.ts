import { difference, intersection, uniqBy } from "lodash-es";

import { compareCalVers } from "@lets-release/calver";
import {
  BaseContext,
  BranchType,
  Branches,
  Channel,
  MainBranch,
  MaintenanceBranch,
  MaintenanceVersionRange,
  NextBranch,
  NextMajorBranch,
  Package,
  ReleaseBranch,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { compareSemVers } from "@lets-release/semver";

import { MergingContext } from "src/types/MergingContext";
import { getPluginChannels } from "src/utils/branch/getPluginChannels";
import { getReleases } from "src/utils/branch/getReleases";
import { sortPackageVersions } from "src/utils/branch/sortPackageVersions";
import { getTagHash } from "src/utils/git/getTagHash";

/**
 * Find releases that have been merged from a higher branch but not added on the channel of the current branch.
 */
export async function getMergingContexts(
  context: Pick<BaseContext, "env" | "repositoryRoot" | "options">,
  packages: Package[],
  { main, next, nextMajor, maintenance = [] }: Branches,
  branch: MainBranch | NextBranch | NextMajorBranch | MaintenanceBranch,
): Promise<Partial<Record<string, MergingContext>>> {
  const { env, repositoryRoot } = context;

  const tags = packages.flatMap<[Package, VersionTag]>((pkg) => {
    const range = branch.ranges[pkg.name];

    if (!range) {
      return [];
    }

    const higherBranches = {
      [BranchType.main]: [next, nextMajor].filter(Boolean),
      [BranchType.next]: [nextMajor].filter(Boolean),
      [BranchType.nextMajor]: [],
      [BranchType.maintenance]: [
        ...maintenance.filter(({ ranges }) => {
          const maintenanceRange = ranges?.[pkg.name];

          if (!maintenanceRange) {
            return false;
          }

          return (
            (pkg.versioning.scheme === VersioningScheme.CalVer
              ? compareCalVers(
                  pkg.versioning.format,
                  maintenanceRange.min,
                  range.min,
                  pkg.versioning.prerelease,
                )
              : compareSemVers(
                  maintenanceRange.min,
                  range.min,
                  pkg.versioning.prerelease,
                )) > 0
          );
        }),
        main,
        next,
        nextMajor,
      ].filter(Boolean),
    }[branch.type] as ReleaseBranch[];

    const [last] = sortPackageVersions(
      pkg,
      uniqBy(
        branch.tags[pkg.name]?.filter(({ version, artifacts }) =>
          artifacts.some(({ pluginName, channels }) => {
            const pluginChannels = getPluginChannels(branch, pluginName);

            if (difference(pluginChannels, channels).length <= 0) {
              return false;
            }

            const higherChannels = higherBranches.reduce(
              (channels: Channel[], releaseBranch: ReleaseBranch) => {
                const pluginChannels = getPluginChannels(
                  releaseBranch,
                  pluginName,
                );

                return [...channels, ...pluginChannels];
              },
              [],
            );

            if (intersection(channels, higherChannels).length <= 0) {
              return false;
            }

            if (branch.type === BranchType.maintenance) {
              return (
                (pkg.versioning.scheme === VersioningScheme.CalVer
                  ? compareCalVers(
                      pkg.versioning.format,
                      version,
                      (range as MaintenanceVersionRange).mergeMin,
                      pkg.versioning.prerelease,
                    )
                  : compareSemVers(
                      version,
                      (range as MaintenanceVersionRange).mergeMin,
                      pkg.versioning.prerelease,
                    )) >= 0
              );
            }

            return true;
          }),
        ) ?? [],
        "version",
      ),
      "desc",
    );

    return last ? [[pkg, last]] : [];
  });

  const entries = await Promise.all(
    tags.flatMap(async ([pkg, { version, tag, artifacts }]) => {
      const releases = getReleases(context, branch, [pkg], {
        [pkg.name]: version,
      });
      const last = releases[pkg.name]?.[0];

      if (
        last &&
        (pkg.versioning.scheme === VersioningScheme.CalVer
          ? compareCalVers(
              pkg.versioning.format,
              last.version,
              version,
              pkg.versioning.prerelease,
            )
          : compareSemVers(last.version, version, pkg.versioning.prerelease)) >
          0
      ) {
        return [];
      }

      const lastRelease = last
        ? {
            ...last,
            hash: await getTagHash(last.tag, {
              cwd: repositoryRoot,
              env,
            }),
          }
        : undefined;
      const hash = await getTagHash(tag, { cwd: repositoryRoot, env });

      return [
        [
          pkg.name,
          {
            lastRelease,
            currentRelease: {
              tag,
              hash,
              version,
              artifacts,
            },
            nextRelease: {
              tag,
              hash,
              version,
              channels: branch.channels,
            },
          },
        ],
      ];
    }),
  );

  return Object.fromEntries(entries.flat());
}
