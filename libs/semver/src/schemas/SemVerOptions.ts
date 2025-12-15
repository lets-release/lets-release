import { z } from "zod";

import {
  NonEmptyString,
  VersioningOptions,
  VersioningScheme,
} from "@lets-release/versioning";

import { isValidPrereleaseSemVer } from "src/helpers/isValidPrereleaseSemVer";
import { isValidSemVer } from "src/helpers/isValidSemVer";

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
  initialVersion: NonEmptyString.check((ctx) => {
    if (!isValidSemVer(ctx.value) || isValidPrereleaseSemVer(ctx.value)) {
      ctx.issues.push({
        input: ctx.value,
        code: "custom",
        message: "Invalid initial version.",
      });
    }
  }).default("1.0.0"),
});

export type SemVerOptions = z.input<typeof SemVerOptions>;

/**
 * Normalized semantic versioning options.
 */
export type NormalizedSemVerOptions = z.output<typeof SemVerOptions>;
