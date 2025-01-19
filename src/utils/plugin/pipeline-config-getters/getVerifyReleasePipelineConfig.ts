import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";

export const getVerifyReleasePipelineConfig: StepPipelineConfigGetter<
  Step.verifyRelease
> = () => ({
  settleAll: true,
});
