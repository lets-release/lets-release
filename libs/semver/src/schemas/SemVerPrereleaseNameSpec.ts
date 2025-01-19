import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { SemVerPrereleaseName } from "src/schemas/SemVerPrereleaseName";

/**
 * The semver pre-release name spec.
 *
 * If set to `true`, the branch name is used as the pre-release name for
 * prerelease branches, the `prerelease` value is used for release branches
 * and maintenance branches.
 *
 * If set to an record, the key is the plugin name or `default`.
 */
export const SemVerPrereleaseNameSpec = z.union([
  z.literal(true),
  SemVerPrereleaseName,
  z.record(
    NonEmptyString,
    z.union([z.literal(true), SemVerPrereleaseName]).optional(),
  ),
]);

export type SemVerPrereleaseNameSpec = z.infer<typeof SemVerPrereleaseNameSpec>;

export type NormalizedSemVerPrereleaseNameSpec = Record<
  string,
  string | undefined
> & {
  default: string;
};
