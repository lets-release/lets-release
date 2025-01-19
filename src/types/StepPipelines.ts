import { Step } from "@lets-release/config";

import { StepPipeline } from "src/types/StepPipeline";

export type StepPipelines = {
  [S in Step]?: StepPipeline<S>;
};
