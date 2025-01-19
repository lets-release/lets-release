import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { StepPipelineResult } from "src/types/StepPipelineResult";
import { StepPipelines } from "src/types/StepPipelines";

export type StepPipeline<T extends Step = Step> = (
  stepPipelines: StepPipelines,
  context: NormalizedStepContext<T>,
) => Promise<StepPipelineResult<T>>;
