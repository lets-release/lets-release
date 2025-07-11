import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

/**
 * Bump version commit configuration.
 */
export const BumpVersionCommit = z.object({
  /**
   * The subject of the commit.
   */
  subject: NonEmptyString,

  /**
   * The body of the commit.
   */
  body: NonEmptyString.optional(),
});

export type BumpVersionCommit = z.input<typeof BumpVersionCommit>;

/**
 * Normalized bump version commit configuration.
 */
export type NormalizedBumpVersionCommit = z.output<typeof BumpVersionCommit>;
