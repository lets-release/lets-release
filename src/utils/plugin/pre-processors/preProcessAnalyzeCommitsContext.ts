import { Commit, Step } from "@lets-release/config";

import { StepPipelinePreProcessor } from "src/types/StepPipelinePreProcessor";

export const preProcessAnalyzeCommitsContext: StepPipelinePreProcessor<
  Step.analyzeCommits
> = ({ commits, ...rest }) => ({
  ...rest,
  commits: commits.filter(
    (commit: Commit) =>
      !/\[skip\s+release]|\[release\s+skip]/i.test(commit.message),
  ),
});
