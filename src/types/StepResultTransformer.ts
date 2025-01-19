import { Step, StepResult } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";

export type StepResultTransformer<T extends Step = Step> = (
  context: NormalizedStepContext<T>,
  func: NormalizedStepFunction<T>,
  result: StepResult<T>,
) => NormalizedStepResult<T> | Promise<NormalizedStepResult<T>>;
