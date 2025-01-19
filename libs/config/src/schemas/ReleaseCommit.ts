import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

/**
 * Release commit configuration.
 */
export const ReleaseCommit = z.object({
  /**
   * Files to include in the release commit.
   *
   * Set to false to disable adding files to the release commit.
   */
  assets: z.union([z.literal(false), z.array(NonEmptyString).min(1)]),

  /**
   * The message for the release commit.
   */
  message: NonEmptyString.default(
    "chore(release): [skip ci]\n\n${releases.map(x => x.tag).join('\\n')}",
  ),
});

export type ReleaseCommit = z.input<typeof ReleaseCommit>;

/**
 * Normalized release commit configuration in context.
 */
export type NormalizedReleaseCommit = z.output<typeof ReleaseCommit>;
