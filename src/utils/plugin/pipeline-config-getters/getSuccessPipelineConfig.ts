import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { preProcessSuccessContext } from "src/utils/plugin/pre-processors/preProcessSuccessContext";

export const getSuccessPipelineConfig: StepPipelineConfigGetter<
  Step.success
> = () => ({
  settleAll: true,
  preProcess: preProcessSuccessContext,
});
