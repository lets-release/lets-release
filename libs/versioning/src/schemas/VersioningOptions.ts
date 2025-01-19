import { z } from "zod";

import { VersioningScheme } from "src/enums/VersioningScheme";

/**
 * Versioning options.
 */
export const VersioningOptions = z.object({
  /**
   * Versioning scheme
   */
  scheme: z.enum(
    Object.values(VersioningScheme) as [
      VersioningScheme,
      ...VersioningScheme[],
    ],
  ),
});

export type VersioningOptions = z.infer<typeof VersioningOptions>;
