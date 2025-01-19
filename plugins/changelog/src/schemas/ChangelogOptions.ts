import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const ChangelogOptions = z.object({
  /**
   * File path of the changelog.
   *
   * @default CHANGELOG.md
   */
  changelogFile: NonEmptyString.default("CHANGELOG.md"),

  /**
   * Title of the changelog file (first line of the file).
   */
  changelogTitle: NonEmptyString.optional(),
});

export type ChangelogOptions = z.input<typeof ChangelogOptions>;
