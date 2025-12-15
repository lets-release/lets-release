import debug from "debug";

import {
  compareCalVers,
  formatCalVer,
  getCalVerTokenValues,
  getLatestCalVer,
  increaseCalVer,
  isCalVerSatisfiedRange,
  isValidPrereleaseCalVer,
  parseCalVer,
} from "@lets-release/calver";
import {
  BranchType,
  ReleaseBranch,
  ReleaseType,
  Step,
  VersioningScheme,
} from "@lets-release/config";
import {
  compareSemVers,
  formatSemVer,
  getLatestSemVer,
  increaseSemVer,
  isSemVerSatisfiedRange,
  isValidPrereleaseSemVer,
  parseSemVer,
} from "@lets-release/semver";
import { VersioningPrereleaseOptions } from "@lets-release/versioning";

import { InvalidNextVersionError } from "src/errors/InvalidNextVersionError";
import { name } from "src/program";
import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getBuildMetadata } from "src/utils/branch/getBuildMetadata";
import { getLatestVersion } from "src/utils/branch/getLatestVersion";
import { getPluginPrereleaseName } from "src/utils/branch/getPluginPrereleaseName";

const namespace = `${name}:utils.branch.getNextVersion`;

export function getNextVersion(
  {
    logger,
    options: { prerelease },
    branches,
    branch,
    commits,
    package: pkg,
    lastRelease,
  }: Pick<
    NormalizedStepContext<Step.analyzeCommits>,
    | "logger"
    | "options"
    | "branches"
    | "branch"
    | "commits"
    | "package"
    | "lastRelease"
  >,
  type: ReleaseType,
  hash: string,
) {
  const { uniqueName, versioning } = pkg;

  // Skip if the branch is not a prerelease branch,
  // and the version range is undefined,
  // and the versioning scheme is SemVer.
  if (
    branch.type !== BranchType.prerelease &&
    !branch.ranges[uniqueName] &&
    versioning.scheme === VersioningScheme.SemVer
  ) {
    debug(namespace)(
      `Skip semver package ${uniqueName} because there is no version range`,
    );

    return;
  }

  // Skip if the branch is a maintenance branch,
  // and the version range is undefined,
  // and the versioning scheme is CalVer.
  if (
    branch.type === BranchType.maintenance &&
    !branch.ranges[uniqueName] &&
    versioning.scheme === VersioningScheme.CalVer
  ) {
    debug(namespace)(
      `Skip calver package ${uniqueName} because there is no version range`,
    );

    return;
  }

  // Skip if the branch is a next or next-major branch,
  // and the versioning scheme is CalVer.
  if (
    [BranchType.next, BranchType.nextMajor].includes(branch.type) &&
    versioning.scheme === VersioningScheme.CalVer
  ) {
    debug(namespace)(
      `Skip calver package ${uniqueName} for ${branch.type} branch`,
    );

    return;
  }

  const options = {
    ...versioning.prerelease,
    prereleaseName:
      branch.type === BranchType.prerelease
        ? getPluginPrereleaseName(branch)
        : getPluginPrereleaseName(branch, prerelease!),
    build: versioning.build
      ? getBuildMetadata(versioning.build, hash)
      : undefined,
  } as VersioningPrereleaseOptions & {
    prereleaseName?: string;
    build?: string;
  };

  let version: string | undefined;

  if (versioning.scheme === VersioningScheme.SemVer) {
    if (lastRelease) {
      if (branch.type === BranchType.prerelease || prerelease) {
        if (
          isValidPrereleaseSemVer(lastRelease.version, options.prereleaseName)
        ) {
          const latestVersion =
            getLatestVersion(pkg, branch) ?? lastRelease.version;

          version = getLatestSemVer(
            [
              increaseSemVer("prerelease", lastRelease.version, options),
              formatSemVer(
                {
                  ...parseSemVer(increaseSemVer(type, latestVersion, options)),
                  prereleaseName: options.prereleaseName,
                  prereleaseNumber: options.initialNumber,
                  build: options.build,
                },
                options,
              ),
            ],
            options,
          );
        } else {
          version = increaseSemVer(
            `${type}-prerelease`,
            lastRelease.version,
            options,
          );
        }
      } else {
        version = increaseSemVer(
          type,
          lastRelease.version,
          versioning.prerelease,
        );
      }

      if (branch.type !== BranchType.prerelease) {
        const range = branch.ranges[uniqueName];

        if (
          version &&
          range &&
          !isSemVerSatisfiedRange(version, range.min, range.max)
        ) {
          throw new InvalidNextVersionError(
            pkg,
            range,
            version,
            branch,
            commits,
            branch.type === BranchType.main
              ? ([branches.next ?? branches.nextMajor].filter(
                  Boolean,
                ) as ReleaseBranch[])
              : branches.maintenance?.filter(
                  ({ ranges }) =>
                    ranges[uniqueName] &&
                    compareSemVers(version!, ranges[uniqueName].min) > 0,
                ),
          );
        }
      }

      logger.log({
        prefix: `[${uniqueName}]`,
        message: `The next release version is ${version}`,
      });
    } else {
      const initialVersion =
        branch.type === BranchType.prerelease
          ? branches.main?.ranges[uniqueName]?.min
          : branch.ranges[uniqueName]?.min;

      if (initialVersion) {
        version =
          branch.type === BranchType.prerelease || prerelease
            ? formatSemVer(
                {
                  ...parseSemVer(initialVersion, options.prereleaseName),
                  prereleaseName: options.prereleaseName,
                  prereleaseNumber: options.initialNumber,
                  build: options.build,
                },
                options,
              )
            : initialVersion;

        logger.log({
          prefix: `[${uniqueName}]`,
          message: `There is no previous release, the next release version is ${version}`,
        });
      } else {
        debug(namespace)(
          `Skip package ${uniqueName} because there is no initial version`,
        );
      }
    }
  }

  if (versioning.scheme === VersioningScheme.CalVer) {
    if (lastRelease) {
      if (branch.type === BranchType.prerelease || prerelease) {
        if (
          isValidPrereleaseCalVer(
            versioning.format,
            lastRelease.version,
            options.prereleaseName,
          )
        ) {
          const latestVersion =
            getLatestVersion(pkg, branch) ?? lastRelease.version;

          version = getLatestCalVer(
            versioning.format,
            [
              increaseCalVer(
                branch.type === BranchType.maintenance
                  ? "prerelease:maintenance"
                  : "prerelease",
                versioning.format,
                lastRelease.version,
                options,
              ),
              formatCalVer(
                versioning.format,
                {
                  ...parseCalVer(
                    versioning.format,
                    increaseCalVer(
                      branch.type === BranchType.maintenance
                        ? `${type}:maintenance`
                        : type,
                      versioning.format,
                      latestVersion,
                      options,
                    ),
                  ),
                  prereleaseName: options.prereleaseName,
                  prereleaseNumber: options.initialNumber,
                  build: options.build,
                },
                options,
              ),
            ],
            options,
          );
        } else {
          version = increaseCalVer(
            branch.type === BranchType.maintenance
              ? `${type}-prerelease:maintenance`
              : `${type}-prerelease`,
            versioning.format,
            lastRelease.version,
            options,
          );
        }
      } else {
        version = increaseCalVer(
          branch.type === BranchType.maintenance ? `${type}:maintenance` : type,
          versioning.format,
          lastRelease.version,
          versioning.prerelease,
        );
      }

      if (branch.type !== BranchType.prerelease) {
        const range = branch.ranges[uniqueName];

        if (
          branch.type === BranchType.maintenance &&
          version &&
          range &&
          !isCalVerSatisfiedRange(
            versioning.format,
            version,
            range.min,
            range.max,
          )
        ) {
          throw new InvalidNextVersionError(
            pkg,
            range,
            version,
            branch,
            commits,
            branches.maintenance?.filter(
              ({ ranges }) =>
                ranges[uniqueName] &&
                compareCalVers(
                  versioning.format,
                  version!,
                  ranges[uniqueName].min,
                ) > 0,
            ),
          );
        }
      }

      logger.log({
        prefix: `[${uniqueName}]`,
        message: `The next release version is ${version}`,
      });
    } else {
      const initialVersion =
        (branch.type === BranchType.maintenance
          ? branch.ranges[uniqueName]?.min
          : undefined) ??
        formatCalVer(
          versioning.format,
          {
            tokenValues: getCalVerTokenValues(versioning.format),
          },
          options,
        );

      version =
        branch.type === BranchType.prerelease || prerelease
          ? formatCalVer(
              versioning.format,
              {
                ...parseCalVer(
                  versioning.format,
                  initialVersion,
                  options.prereleaseName,
                ),
                prereleaseName: options.prereleaseName,
                prereleaseNumber: options.initialNumber,
                build: options.build,
              },
              options,
            )
          : initialVersion;

      logger.log({
        prefix: `[${uniqueName}]`,
        message: `There is no previous release, the next release version is ${version}`,
      });
    }
  }

  return version;
}
