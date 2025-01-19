import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";

export interface NormalizedStepFunction<T extends Step = Step> {
  pluginName: string;
  (
    context: NormalizedStepContext<T>,
  ): NormalizedStepResult<T> | Promise<NormalizedStepResult<T>>;
}
