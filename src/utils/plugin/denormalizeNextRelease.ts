import { formatCalVer, parseCalVer } from "@lets-release/calver";
import {
  NextRelease,
  NormalizedNextRelease,
  Step,
  VersioningScheme,
} from "@lets-release/config";
import { formatSemVer, parseSemVer } from "@lets-release/semver";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getBuildMetadata } from "src/utils/branch/getBuildMetadata";

export function denormalizeNextRelease<T extends Step = Step>(
  normalizedContext: NormalizedStepContext<T>,
  pluginName: string,
  normalized?: NormalizedNextRelease,
  { updateBuild }: { updateBuild?: boolean } = {},
): NextRelease | undefined {
  const { branch, package: pkg } =
    normalizedContext as unknown as NormalizedStepContext<Step.analyzeCommits>;

  if (!branch || !pkg || !normalized) {
    return;
  }

  const { hash, version, channels: normalizedChannels, ...rest } = normalized;
  const channels = normalizedChannels[pluginName] ?? normalizedChannels.default;
  const build = pkg.versioning.build
    ? getBuildMetadata(pkg.versioning.build, hash)
    : undefined;

  if (pkg.versioning.scheme === VersioningScheme.CalVer) {
    const calver = parseCalVer(
      pkg.versioning.format,
      version,
      pkg.versioning.prerelease,
    );

    return {
      ...rest,
      hash,
      version: formatCalVer(
        pkg.versioning.format,
        { ...calver, build: updateBuild && build ? build : calver.build },
        pkg.versioning.prerelease,
      ),
      channels,
    };
  }

  const semver = parseSemVer(version, pkg.versioning.prerelease);

  return {
    ...rest,
    hash,
    version: formatSemVer(
      { ...semver, build: updateBuild && build ? build : semver.build },
      pkg.versioning.prerelease,
    ),
    channels,
  };
}
