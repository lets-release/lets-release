import { z } from "zod";

import { VersioningOptions, VersioningScheme } from "@lets-release/versioning";

import { CalVerFormat } from "src/schemas/CalVerFormat";

/**
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
});

export type CalVerOptions = z.input<typeof CalVerOptions>;

/**
 * Normalized calendar versioning options.
 */
export type NormalizedCalVerOptions = z.output<typeof CalVerOptions>;
