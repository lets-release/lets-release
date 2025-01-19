import { z } from "zod";

import { SemVerPrereleaseName } from "@lets-release/semver";

/**
 * lets-release cli options.
 */
export const CliOptions = z.object({
  /**
   * The key to retrieved prerelease options from `prereleases` property.
   *
   * It is use for making a pre-release from a release or maintenance branch.
   */
  prerelease: SemVerPrereleaseName.optional(),

  /**
   * Dry-run mode, skip publishing, print next versions and release notes.
   */
  dryRun: z.boolean().optional(),

  /**
   * Set to true to skip Continuous Integration environment verifications.
   * This allows for making releases from a local machine.
   */
  skipCiVerifications: z.boolean().optional(),

  /**
   * Output debugging information
   */
  debug: z.boolean().optional(),
});

export type CliOptions = z.infer<typeof CliOptions>;
