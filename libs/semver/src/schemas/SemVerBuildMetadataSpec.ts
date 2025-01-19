import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { SemVerBuildMetadata } from "src/schemas/SemVerBuildMetadata";

/**
 * The semver build metadata spec.
 *
 * If set to `true`, the tag short hash is used as the build metadata.
 *
 * If set to an record, the key is the plugin name or `default`.
 */
export const SemVerBuildMetadataSpec = z.union([
  z.literal(true),
  SemVerBuildMetadata,
  z.record(
    NonEmptyString,
    z.union([z.literal(true), SemVerBuildMetadata]).optional(),
  ),
]);

export type SemVerBuildMetadataSpec = z.infer<typeof SemVerBuildMetadataSpec>;

export type NormalizedSemVerBuildMetadataSpec = Record<
  string,
  string | undefined
> & {
  default: string;
};
