import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { StepPipelineResult } from "src/types/StepPipelineResult";

export type StepPipelinePostProcessor<T extends Step = Step> = (
  context: NormalizedStepContext<T>,
  results: NormalizedStepResult<T>[],
) => StepPipelineResult<T> | Promise<StepPipelineResult<T>>;
