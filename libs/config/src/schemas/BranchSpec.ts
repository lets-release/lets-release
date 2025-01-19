import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import {
  MaintenanceBranchObject,
  PrereleaseBranchObject,
  ReleaseBranchObject,
} from "src/schemas/BranchObject";

/**
 * Release branch spec.
 */
export const ReleaseBranchSpec = z.union([NonEmptyString, ReleaseBranchObject]);

export type ReleaseBranchSpec = z.infer<typeof ReleaseBranchSpec>;

/**
 * Maintenance branch spec.
 */
export const MaintenanceBranchSpec = z.union([
  NonEmptyString,
  MaintenanceBranchObject,
]);

export type MaintenanceBranchSpec = z.infer<typeof MaintenanceBranchSpec>;

/**
 * Prerelease branch spec.
 */
export const PrereleaseBranchSpec = z.union([
  NonEmptyString,
  PrereleaseBranchObject,
]);

export type PrereleaseBranchSpec = z.infer<typeof PrereleaseBranchSpec>;
