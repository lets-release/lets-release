import { intersection, isNil } from "lodash-es";

import {
  compareCalVers,
  isValidPrereleaseCalVer,
  parseCalVer,
} from "@lets-release/calver";
import {
  BaseContext,
  BranchType,
  Channel,
  MainBranch,
  MaintenanceBranch,
  NextBranch,
  NextMajorBranch,
  Package,
  PrereleaseBranch,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import {
  compareSemVers,
  isValidPrereleaseSemVer,
  parseSemVer,
} from "@lets-release/semver";

import { getPluginChannels } from "src/utils/branch/getPluginChannels";
import { getPluginPrereleaseName } from "src/utils/branch/getPluginPrereleaseName";

export function filterTag(
  { options }: Pick<BaseContext, "options">,
  branch:
    | MainBranch
    | NextBranch
    | NextMajorBranch
    | MaintenanceBranch
    | PrereleaseBranch,
  pkg: Package,
  { version, artifacts }: Pick<VersionTag, "version" | "artifacts">,
  before?: string,
) {
  if (pkg.versioning.scheme === VersioningScheme.CalVer) {
    if (
      !isNil(before) &&
      compareCalVers(
        pkg.versioning.format,
        version,
        before,
        pkg.versioning.prerelease,
      ) >= 0
    ) {
      return false;
    }

    if (
      !isValidPrereleaseCalVer(
        pkg.versioning.format,
        version,
        pkg.versioning.prerelease,
      )
    ) {
      return true;
    }
  } else {
    if (
      !isNil(before) &&
      compareSemVers(version, before, pkg.versioning.prerelease) >= 0
    ) {
      return false;
    }

    if (!isValidPrereleaseSemVer(version)) {
      return true;
    }
  }

  const prereleaseName =
    pkg.versioning.scheme === VersioningScheme.CalVer
      ? parseCalVer(pkg.versioning.format, version, pkg.versioning.prerelease)
          .prereleaseName
      : parseSemVer(version, pkg.versioning.prerelease).prereleaseName;

  const verify = (
    artifactChannels: Channel[],
    pluginChannels: Channel[],
    pluginPrereleaseName?: string,
  ) => {
    if (!pluginPrereleaseName || pluginPrereleaseName !== prereleaseName) {
      return false;
    }

    if (
      artifactChannels?.length &&
      intersection(artifactChannels, pluginChannels).length <= 0
    ) {
      return false;
    }

    return true;
  };

  if (branch.type === BranchType.prerelease) {
    return artifacts.some(({ pluginName, channels }) =>
      verify(
        channels,
        getPluginChannels(branch, pluginName),
        getPluginPrereleaseName(branch, pkg, pluginName),
      ),
    );
  }

  const prerelease = options.prerelease;

  if (prerelease) {
    return artifacts.some(({ pluginName, channels }) =>
      verify(
        channels,
        getPluginChannels(branch, pluginName, prerelease),
        getPluginPrereleaseName(branch, pkg, prerelease, pluginName),
      ),
    );
  }

  return false;
}
