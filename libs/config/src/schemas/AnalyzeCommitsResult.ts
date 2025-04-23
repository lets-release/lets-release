import { z } from "zod";

import { ReleaseType } from "src/enums/ReleaseType";

/**
 * Result of analyzeCommits step.
 */
export const AnalyzeCommitsResult = z
  .enum(Object.values(ReleaseType) as [ReleaseType, ...ReleaseType[]])
  .optional();

export type AnalyzeCommitsResult = z.infer<typeof AnalyzeCommitsResult>;
