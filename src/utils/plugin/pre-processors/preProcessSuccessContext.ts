import { Step } from "@lets-release/config";

import { StepPipelinePreProcessor } from "src/types/StepPipelinePreProcessor";
import { maskObject } from "src/utils/maskObject";

export const preProcessSuccessContext: StepPipelinePreProcessor<
  Step.success
> = ({ releases, env, ...rest }) => ({
  ...rest,
  env,
  releases: releases.map((release) => maskObject(env, release)),
});
