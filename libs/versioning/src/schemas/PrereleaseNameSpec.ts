import { z } from "zod";

import { NonEmptyString } from "src/schemas/NonEmptyString";
import { PrereleaseName } from "src/schemas/PrereleaseName";

/**
 * The prerelease name spec.
 *
 * If set to `true`, the branch name is used as the pre-release name for
 * prerelease branches, the `prerelease` value is used for release branches
 * and maintenance branches.
 *
 * If set to an record, the key is the plugin name or `default`.
 */
export const PrereleaseNameSpec = z.union([
  z.literal(true),
  PrereleaseName,
  z.record(
    NonEmptyString,
    z.union([z.literal(true), PrereleaseName]).optional(),
  ),
]);

export type PrereleaseNameSpec = z.infer<typeof PrereleaseNameSpec>;

export type NormalizedPrereleaseNameSpec = Record<
  string,
  string | undefined
> & {
  default: string;
};
