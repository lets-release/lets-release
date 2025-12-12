import { z } from "zod";

import { DEFAULT_VERSIONING_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_VERSIONING_PRERELEASE_OPTIONS";
import { VersioningScheme } from "src/enums/VersioningScheme";
import { BuildMetadataSpec } from "src/schemas/BuildMetadataSpec";
import { VersioningPrereleaseOptions } from "src/schemas/VersioningPrereleaseOptions";

/**
 * Versioning options.
 */
export const VersioningOptions = z.object({
  /**
   * Versioning scheme
   */
  scheme: z.enum(
    Object.values(VersioningScheme) as [
      VersioningScheme,
      ...VersioningScheme[],
    ],
  ),

  /**
   * Prerelease options.
   */
  prerelease: VersioningPrereleaseOptions.default(
    DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
  ),

  /**
   * Build metadata.
   */
  build: BuildMetadataSpec.optional(),
});

export type VersioningOptions = z.infer<typeof VersioningOptions>;
