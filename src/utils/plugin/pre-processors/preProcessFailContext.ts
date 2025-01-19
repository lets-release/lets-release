import { Step } from "@lets-release/config";

import { StepPipelinePreProcessor } from "src/types/StepPipelinePreProcessor";
import { maskObject } from "src/utils/maskObject";

export const preProcessFailContext: StepPipelinePreProcessor<Step.fail> = ({
  error,
  env,
  ...rest
}) => ({
  ...rest,
  env,
  error: maskObject(env, error),
});
