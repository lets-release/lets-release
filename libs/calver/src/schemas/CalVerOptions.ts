import { z } from "zod";

import { VersioningOptions, VersioningScheme } from "@lets-release/versioning";

import { DEFAULT_CALVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_CALVER_PRERELEASE_OPTIONS";
import { CalVerBuildMetadataSpec } from "src/schemas/CalVerBuildMetadataSpec";
import { CalVerFormat } from "src/schemas/CalVerFormat";
import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

/*
 * Calendar versioning options.
 */
export const CalVerOptions = VersioningOptions.extend({
  /**
   * Versioning scheme
   */
  scheme: z.literal(VersioningScheme.CalVer),

  /**
   * CalVer versioning format
   */
  format: CalVerFormat,

  /**
   * Pre-release options.
   */
  prerelease: CalVerPrereleaseOptions.default(
    DEFAULT_CALVER_PRERELEASE_OPTIONS,
  ),

  /**
   * Build metadata.
   */
  build: CalVerBuildMetadataSpec.optional(),
});

export type CalVerOptions = z.input<typeof CalVerOptions>;

/**
 * Normalized calendar versioning options.
 */
export type NormalizedCalVerOptions = z.output<typeof CalVerOptions>;
