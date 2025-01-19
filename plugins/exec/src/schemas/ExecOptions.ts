import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";

export const ExecOptions = z.object({
  cwd: NonEmptyString.optional(),
  shell: z.union([NonEmptyString, z.boolean()]).optional(),
  findPackagesCmd: NonEmptyString.optional(),
  verifyConditionsCmd: NonEmptyString.optional(),
  analyzeCommitsCmd: NonEmptyString.optional(),
  verifyReleaseCmd: NonEmptyString.optional(),
  generateNotesCmd: NonEmptyString.optional(),
  addChannelsCmd: NonEmptyString.optional(),
  prepareCmd: NonEmptyString.optional(),
  publishCmd: NonEmptyString.optional(),
  successCmd: NonEmptyString.optional(),
  failCmd: NonEmptyString.optional(),
});

export type ExecOptions = z.infer<typeof ExecOptions>;
