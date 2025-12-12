import { z } from "zod";

import { BuildMetadata } from "src/schemas/BuildMetadata";
import { NonEmptyString } from "src/schemas/NonEmptyString";

/**
 * The build metadata spec.
 *
 * If set to `true`, the tag short hash is used as the build metadata.
 *
 * If set to an record, the key is the plugin name or `default`.
 */
export const BuildMetadataSpec = z.union([
  z.literal(true),
  BuildMetadata,
  z.record(
    NonEmptyString,
    z.union([z.literal(true), BuildMetadata]).optional(),
  ),
]);

export type BuildMetadataSpec = z.infer<typeof BuildMetadataSpec>;

export type NormalizedBuildMetadataSpec = Record<string, string | undefined> & {
  default: string;
};
