import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { postProcessReleaseResults } from "src/utils/plugin/post-processors/postProcessReleaseResults";
import { artifactInfoToArtifact } from "src/utils/plugin/transformers/artifactInfoToArtifact";

export const getReleasePipelineConfig: StepPipelineConfigGetter<Step.addChannels> &
  StepPipelineConfigGetter<Step.publish> = () => ({
  transform: artifactInfoToArtifact,
  postProcess: postProcessReleaseResults,
});
