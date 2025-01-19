import { Step } from "src/enums/Step";
import { AnalyzeCommitsResult } from "src/schemas/AnalyzeCommitsResult";
import { FindPackagesResult } from "src/schemas/FindPackagesResult";
import { GenerateNotesResult } from "src/schemas/GenerateNotesResult";
import { ReleaseResult } from "src/schemas/ReleaseResult";

export type StepResult<T extends Step = Step> = {
  [Step.findPackages]: FindPackagesResult;
  [Step.verifyConditions]: unknown;
  [Step.analyzeCommits]: AnalyzeCommitsResult;
  [Step.verifyRelease]: unknown;
  [Step.generateNotes]: GenerateNotesResult;
  [Step.addChannels]: ReleaseResult;
  [Step.prepare]: unknown;
  [Step.publish]: ReleaseResult;
  [Step.success]: unknown;
  [Step.fail]: unknown;
}[T];
