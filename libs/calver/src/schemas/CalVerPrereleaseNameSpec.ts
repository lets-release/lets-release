import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { CalVerPrereleaseName } from "src/schemas/CalVerPrereleaseName";

/**
 * The calver pre-release name spec.
 *
 * If set to `true`, the branch name is used as the pre-release name for
 * prerelease branches, the `prerelease` value is used for release branches
 * and maintenance branches.
 *
 * If set to an record, the key is the plugin name or `default`.
 */
export const CalVerPrereleaseNameSpec = z.union([
  z.literal(true),
  CalVerPrereleaseName,
  z.record(
    NonEmptyString,
    z.union([z.literal(true), CalVerPrereleaseName]).optional(),
  ),
]);

export type CalVerPrereleaseNameSpec = z.infer<typeof CalVerPrereleaseNameSpec>;

export type NormalizedCalVerPrereleaseNameSpec = Record<
  string,
  string | undefined
> & {
  default: string;
};
