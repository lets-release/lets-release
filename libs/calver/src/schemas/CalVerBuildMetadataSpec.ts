import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { CalVerBuildMetadata } from "src/schemas/CalVerBuildMetadata";

/**
 * The calver build metadata spec.
 *
 * If set to `true`, the tag short hash is used as the build metadata.
 *
 * If set to an record, the key is the plugin name or `default`.
 */
export const CalVerBuildMetadataSpec = z.union([
  z.literal(true),
  CalVerBuildMetadata,
  z.record(
    NonEmptyString,
    z.union([z.literal(true), CalVerBuildMetadata]).optional(),
  ),
]);

export type CalVerBuildMetadataSpec = z.infer<typeof CalVerBuildMetadataSpec>;

export type NormalizedCalVerBuildMetadataSpec = Record<
  string,
  string | undefined
> & {
  default: string;
};
