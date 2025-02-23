import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

export const PackageDependency = z.object({
  /**
   * Package type.
   */
  type: NonEmptyString,

  /**
   * Name of the package.
   */
  name: NonEmptyString,
});

export type PackageDependency = z.infer<typeof PackageDependency>;
