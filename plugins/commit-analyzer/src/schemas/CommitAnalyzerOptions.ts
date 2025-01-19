import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";
import { ConventionalChangelogOptions } from "@lets-release/conventional-changelog";

import { ReleaseRule } from "src/schemas/ReleaseRule";

export const CommitAnalyzerOptions = ConventionalChangelogOptions.omit({
  writerOptions: true,
}).extend({
  /**
   * An external module, a path to a module or an Array of rules.
   */
  releaseRules: z
    .union([NonEmptyString, z.array(ReleaseRule).min(1)])
    .optional(),
});

export type CommitAnalyzerOptions = z.input<typeof CommitAnalyzerOptions>;
