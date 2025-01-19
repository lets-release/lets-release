import { NormalizedChannels } from "src/schemas/Channels";
import { NormalizedPrereleases } from "src/schemas/Prereleases";
import { BaseBranch } from "src/types/BaseBranch";
import { ReleaseVersionRange } from "src/types/ReleaseVersionRange";

/**
 * Release branch on the repository.
 */
export interface ReleaseBranch extends BaseBranch {
  /**
   * The distribution channels on which to publish releases from this
   * branch.
   */
  channels: NormalizedChannels;

  /**
   * The package version ranges (package name as key).
   */
  ranges: Record<string, ReleaseVersionRange | undefined>;

  /**
   * The record of prerelease options.
   */
  prereleases?: NormalizedPrereleases;
}
