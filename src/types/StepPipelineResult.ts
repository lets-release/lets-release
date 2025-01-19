import { Artifact, Package, ReleaseType, Step } from "@lets-release/config";

export type StepPipelineResult<T extends Step = Step> = {
  [Step.findPackages]: Package[] | undefined;
  [Step.verifyConditions]: unknown;
  [Step.analyzeCommits]: ReleaseType | undefined;
  [Step.verifyRelease]: unknown;
  [Step.generateNotes]: string | undefined;
  [Step.addChannels]: Artifact[] | undefined;
  [Step.prepare]: unknown;
  [Step.publish]: Artifact[] | undefined;
  [Step.success]: unknown;
  [Step.fail]: unknown;
}[T];
