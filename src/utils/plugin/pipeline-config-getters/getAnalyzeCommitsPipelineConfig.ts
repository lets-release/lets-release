import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { postProcessAnalyzeCommitsResults } from "src/utils/plugin/post-processors/postProcessAnalyzeCommitsResults";
import { preProcessAnalyzeCommitsContext } from "src/utils/plugin/pre-processors/preProcessAnalyzeCommitsContext";

export const getAnalyzeCommitsPipelineConfig: StepPipelineConfigGetter<
  Step.analyzeCommits
> = () => ({
  preProcess: preProcessAnalyzeCommitsContext,
  postProcess: postProcessAnalyzeCommitsResults,
});
