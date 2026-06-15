import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

/**
 * Release artifact information return from plugin (`addChannels` or `publish` step).
 */
export const ArtifactInfo = z.object({
  /**
   * The release name.
   */
  name: NonEmptyString,

  /**
   * The release URL.
   */
  url: NonEmptyString.optional(),
});

export type ArtifactInfo = z.infer<typeof ArtifactInfo>;
