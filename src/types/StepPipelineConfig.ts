import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { StepPipelinePostProcessor } from "src/types/StepPipelinePostProcessor";
import { StepPipelinePreProcessor } from "src/types/StepPipelinePreProcessor";
import { StepResultTransformer } from "src/types/StepResultTransformer";

export interface StepPipelineConfig<T extends Step = Step> {
  settleAll?: boolean;
  preProcess?: StepPipelinePreProcessor<T>;
  postProcess?: StepPipelinePostProcessor<T>;
  transform?: StepResultTransformer<T>;
  getNextContext?: (
    context: NormalizedStepContext<T>,
    result?: NormalizedStepResult<T>,
  ) => NormalizedStepContext<T> | Promise<NormalizedStepContext<T>>;
}
