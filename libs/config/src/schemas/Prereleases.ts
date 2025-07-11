import { z } from "zod";

import { SemVerPrereleaseName } from "@lets-release/semver";

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
  SemVerPrereleaseName,
  PrereleaseOptions.optional(),
);

export type Prereleases = z.input<typeof Prereleases>;

export type NormalizedPrereleases = Record<
  string,
  NormalizedPrereleaseOptions | undefined
>;
