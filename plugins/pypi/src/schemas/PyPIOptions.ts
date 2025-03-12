import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const PyPIOptions = z.object({
  /**
   * Whether to skip publishing the package to the PyPI server. If true the
   * version will still be updated.
   *
   * Default: false.
   */
  skipPublishing: z.boolean().optional(),

  /**
   * The output directory to which distributions should be written.
   */
  distDir: NonEmptyString.default("dist"),
});

export type PyPIOptions = z.input<typeof PyPIOptions>;

export type ResolvedPyPIOptions = z.output<typeof PyPIOptions>;
