import { Step } from "@lets-release/config";

import { StepPipelinePostProcessor } from "src/types/StepPipelinePostProcessor";

export const postProcessFindPackagesResults: StepPipelinePostProcessor<
  Step.findPackages
> = (context, results) => results.flatMap((result) => result ?? []);
