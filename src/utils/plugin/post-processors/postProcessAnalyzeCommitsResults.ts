import { RELEASE_TYPES, Step } from "@lets-release/config";

import { StepPipelinePostProcessor } from "src/types/StepPipelinePostProcessor";

export const postProcessAnalyzeCommitsResults: StepPipelinePostProcessor<
  Step.analyzeCommits
> = (context, results) => {
  let highest = -1;

  const reversedReleaseTypes = RELEASE_TYPES.toReversed();

  for (const result of results) {
    const typeIndex = result ? reversedReleaseTypes.indexOf(result) : -1;

    highest = Math.max(typeIndex, highest);
  }

  return reversedReleaseTypes[highest];
};
