import {
  NormalizedChannels,
  PrereleaseBranch,
  ReleaseBranch,
} from "@lets-release/config";

import { normalizeChannels } from "src/utils/branch/normalizeChannels";

export function getNormalizedChannels(
  branch: PrereleaseBranch | ReleaseBranch,
  prerelease?: string,
): NormalizedChannels {
  if ((branch as PrereleaseBranch).prerelease) {
    return (branch as PrereleaseBranch).prerelease.channels;
  }

  if (prerelease) {
    return (
      (branch as ReleaseBranch).prereleases?.[prerelease]?.channels ??
      normalizeChannels(branch.name, [prerelease])
    );
  }

  return (branch as ReleaseBranch).channels;
}
