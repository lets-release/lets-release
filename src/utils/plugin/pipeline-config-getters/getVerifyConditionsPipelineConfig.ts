import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";

export const getVerifyConditionsPipelineConfig: StepPipelineConfigGetter<
  Step.verifyConditions
> = () => ({
  settleAll: true,
});
