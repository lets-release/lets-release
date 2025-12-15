import { z } from "zod";

import { PrereleaseName } from "@lets-release/versioning";

import {
  NormalizedPrereleaseOptions,
  PrereleaseOptions,
} from "src/schemas/PrereleaseOptions";

/**
 * Prerelease options record for release or maintenance branches.
 *
 * The key will be use to find the prerelease options.
 */
export const Prereleases = z.record(
  PrereleaseName,
  PrereleaseOptions.optional(),
);

export type Prereleases = z.input<typeof Prereleases>;

export type NormalizedPrereleases = Record<
  string,
  NormalizedPrereleaseOptions | undefined
>;
