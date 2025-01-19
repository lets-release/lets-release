import { z } from "zod";

import { VersioningPrereleaseOptions } from "@lets-release/versioning";

/**
 * Calendar versioning prerelease options.
 */
export const CalVerPrereleaseOptions = VersioningPrereleaseOptions.extend({
  /**
   * The pre-release name prefix.
   */
  prefix: z
    .union([z.literal("."), z.literal("_"), z.literal("-"), z.literal("")])
    .default("-"),

  /**
   * The pre-release name suffix.
   */
  suffix: z.union([z.literal("."), z.literal("")]).default("."),
});

export type CalVerPrereleaseOptions = z.input<typeof CalVerPrereleaseOptions>;

/**
 * Normalized calendar versioning prerelease options.
 */
export type NormalizedCalVerPrereleaseOptions = z.output<
  typeof CalVerPrereleaseOptions
>;
