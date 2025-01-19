import { z } from "zod";

import { VersioningPrereleaseOptions } from "@lets-release/versioning";

/**
 * Semantic versioning prerelease options.
 */
export const SemVerPrereleaseOptions = VersioningPrereleaseOptions.extend({
  /**
   * The pre-release name prefix (only for formatting semver).
   */
  prefix: z.union([z.literal("-"), z.literal("")]).default("-"),

  /**
   * The pre-release name suffix (only for formatting semver).
   */
  suffix: z.union([z.literal("."), z.literal("")]).default("."),
});

export type SemVerPrereleaseOptions = z.input<typeof SemVerPrereleaseOptions>;

/**
 * Normalized semantic versioning prerelease options.
 */
export type NormalizedSemVerPrereleaseOptions = z.output<
  typeof SemVerPrereleaseOptions
>;
