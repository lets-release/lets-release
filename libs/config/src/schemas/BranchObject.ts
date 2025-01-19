import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { BranchType } from "src/enums/BranchType";
import { Channels } from "src/schemas/Channels";
import { PrereleaseOptions } from "src/schemas/PrereleaseOptions";
import { Prereleases } from "src/schemas/Prereleases";
import { Ranges } from "src/schemas/Ranges";

/**
 * Base branch object.
 */
export const BaseBranchObject = z.object({
  /**
   * The name of the git branch.
   *
   * A `name` is required for all types of branch. It can be defined as a
   * [glob][] in which case the definition will be expanded to one per
   * matching branch existing in the repository.
   *
   * If `name` doesn't match any branch existing in the repository, the
   * definition will be ignored. For example, the default configuration
   * includes the definition `next` and `next-major` which will only
   * become active when the branches `next` and/or `next-major` are
   * created in the repository.
   *
   * [glob]: https://github.com/micromatch/micromatch#matching-features
   */
  name: NonEmptyString,
});

export type BaseBranchObject = z.infer<typeof BaseBranchObject>;

/**
 * Release branch object.
 */
export const ReleaseBranchObject = BaseBranchObject.extend({
  /**
   * The distribution channels on which to publish releases from this
   * branch.
   *
   * This property applies only to release or maintenance branches.
   *
   * If not set, `[null]` is the default value for the first release branch.
   * For other branches, the channel name will be the same as the branch
   * name.
   */
  channels: Channels.optional(),

  /**
   * The prerelease options record.
   *
   * This property applies only to release or maintenance branches.
   */
  prereleases: Prereleases.optional(),
});

export type ReleaseBranchObject = z.infer<typeof ReleaseBranchObject>;

/**
 * Maintenance branch object.
 */
export const MaintenanceBranchObject = ReleaseBranchObject.extend({
  /**
   * The version ranges to support on this branch.
   *
   * The `ranges` only apply to maintenance branches. If no range is specified
   * but the `name` is formatted like `{packageName}{refSeparator}{range}`,
   * the branch will be considered a maintenance branch.
   *
   * Required for maintenance branches, unless `name` is formatted like
   * `{packageName}{refSeparator}{range}`.
   */
  ranges: Ranges.optional(),
});

export type MaintenanceBranchObject = z.infer<typeof MaintenanceBranchObject>;

/**
 * Prerelease branch object.
 */
export const PrereleaseBranchObject = BaseBranchObject.extend({
  /**
   * The prerelease options.
   *
   * This property applies only to pre-release branches.
   *
   * Required for pre-release branches.
   */
  prerelease: PrereleaseOptions.optional(),
});

export type PrereleaseBranchObject = z.infer<typeof PrereleaseBranchObject>;

export type BranchObject<T extends BranchType = BranchType> = {
  [BranchType.main]: ReleaseBranchObject;
  [BranchType.next]: ReleaseBranchObject;
  [BranchType.nextMajor]: ReleaseBranchObject;
  [BranchType.maintenance]: MaintenanceBranchObject;
  [BranchType.prerelease]: PrereleaseBranchObject;
}[T];
