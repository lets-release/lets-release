import { z } from "zod";

import {
  NormalizedPrereleaseNameSpec,
  PrereleaseNameSpec,
} from "@lets-release/versioning";

import { Channels, NormalizedChannels } from "src/schemas/Channels";

/**
 * Prerelease options.
 */
export const PrereleaseOptions = z.object({
  /**
   * The pre-release distribution channels.
   */
  channels: Channels.optional(),

  /**
   * The pre-release name.
   */
  name: PrereleaseNameSpec,
});

export type PrereleaseOptions = z.infer<typeof PrereleaseOptions>;

export interface NormalizedPrereleaseOptions {
  /**
   * The prerelease distribution channels.
   */
  channels: NormalizedChannels;

  /**
   * The prerelease name.
   */
  name: NormalizedPrereleaseNameSpec;
}
