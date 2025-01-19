import { Artifact, Step } from "@lets-release/config";

import { StepPipelinePostProcessor } from "src/types/StepPipelinePostProcessor";

export const postProcessReleaseResults: StepPipelinePostProcessor<Step.addChannels> &
  StepPipelinePostProcessor<Step.publish> = (context, results) =>
  results?.filter(Boolean) as Artifact[];
