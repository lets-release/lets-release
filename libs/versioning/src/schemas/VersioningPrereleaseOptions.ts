import { z } from "zod";

/**
 * Versioning prerelease options.
 */
export const VersioningPrereleaseOptions = z.object({
  /**
   * Initial number of the pre-release version (only for formatting versions).
   */
  initialNumber: z.union([z.literal(0), z.literal(1)]).default(1),

  /**
   * Ignore zero number of the pre-release version (only for formatting versions).
   */
  ignoreZeroNumber: z.boolean().default(true),
});

export type VersioningPrereleaseOptions = z.input<
  typeof VersioningPrereleaseOptions
>;

/**
 * Normalized versioning prerelease options.
 */
export type NormalizedVersioningPrereleaseOptions = z.output<
  typeof VersioningPrereleaseOptions
>;
