import { BaseContext, Step } from "@lets-release/config";

import { StepPipelineConfig } from "src/types/StepPipelineConfig";
import { StepPipelines } from "src/types/StepPipelines";

export type StepPipelineConfigGetter<T extends Step = Step> = (
  stepPipelines: StepPipelines,
  logger: BaseContext["logger"],
) => StepPipelineConfig<T>;
