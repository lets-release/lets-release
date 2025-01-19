import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { preProcessFailContext } from "src/utils/plugin/pre-processors/preProcessFailContext";

export const getFailPipelineConfig: StepPipelineConfigGetter<
  Step.fail
> = () => ({
  settleAll: true,
  preProcess: preProcessFailContext,
});
