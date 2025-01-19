import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

/**
 * Package info return by plugin findPackages step.
 */
export const PackageInfo = z.object({
  /**
   * Absolute path to the package root.
   */
  path: NonEmptyString,

  /**
   * Name of the package.
   */
  name: NonEmptyString,
});

export type PackageInfo = z.infer<typeof PackageInfo>;
