import { z } from "zod";

import {
  NonEmptyString,
  VersioningOptions,
  VersioningScheme,
} from "@lets-release/versioning";

import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_SEMVER_PRERELEASE_OPTIONS";
import { isValidPrereleaseSemVer } from "src/helpers/isValidPrereleaseSemVer";
import { isValidSemVer } from "src/helpers/isValidSemVer";
import { SemVerBuildMetadataSpec } from "src/schemas/SemVerBuildMetadataSpec";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

/**
 * Semantic versioning options.
 */
export const SemVerOptions = VersioningOptions.extend({
  /**
   * Versioning scheme
   */
  scheme: z.literal(VersioningScheme.SemVer),

  /**
   * Initial version
   *
   * @default 1.0.0
   */
  initialVersion: NonEmptyString.superRefine((val, ctx) => {
    if (!isValidSemVer(val) || isValidPrereleaseSemVer(val)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "Invalid initial version.",
      });
    }
  }).default("1.0.0"),

  /**
   * Pre-release options.
   */
  prerelease: SemVerPrereleaseOptions.default(
    DEFAULT_SEMVER_PRERELEASE_OPTIONS,
  ),

  /**
   * Build metadata.
   */
  build: SemVerBuildMetadataSpec.optional(),
});

export type SemVerOptions = z.input<typeof SemVerOptions>;

/**
 * Normalized semantic versioning options.
 */
export type NormalizedSemVerOptions = z.output<typeof SemVerOptions>;
