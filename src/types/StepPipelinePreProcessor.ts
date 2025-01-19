import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";

export type StepPipelinePreProcessor<T extends Step = Step> = (
  context: NormalizedStepContext<T>,
) => NormalizedStepContext<T> | Promise<NormalizedStepContext<T>>;
