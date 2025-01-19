import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const NpmOptions = z.object({
  /**
   * Whether to skip publishing the npm package to the registry. If true the
   * package.json version will still be updated.
   *
   * Default: true if the package.json private property is true, false otherwise.
   */
  skipPublishing: z.boolean().optional(),

  /**
   * Directory path in which to write the package tarball. If not set the tarball is
   * not be kept on the file system.
   */
  tarballDir: NonEmptyString.optional(),
});

export type NpmOptions = z.input<typeof NpmOptions>;
