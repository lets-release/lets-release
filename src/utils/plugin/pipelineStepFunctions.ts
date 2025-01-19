import { Step, extractErrors } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { StepPipelineConfig } from "src/types/StepPipelineConfig";
import { StepPipelineResult } from "src/types/StepPipelineResult";

export function pipelineStepFunctions<T extends Step = Step>(
  funcs: NormalizedStepFunction<T>[],
  {
    settleAll = false,
    preProcess,
    postProcess,
    transform,
    getNextContext,
  }: StepPipelineConfig<T> = {},
) {
  return async (baseContext: NormalizedStepContext<T>) => {
    const results = [];
    const errors = [];

    let context = (await preProcess?.(baseContext)) ?? baseContext;

    for (const func of funcs) {
      let result: NormalizedStepResult<T> | undefined;

      try {
        // Call the step with the input computed at the end of the previous iteration and save intermediary result
        result = await func(context);
        result = (await transform?.(context, func, result)) ?? result;

        results.push(result);
      } catch (error) {
        if (settleAll) {
          errors.push(...extractErrors(error));
        } else {
          throw error;
        }
      }

      // Prepare input for the next step, passing the input of the last iteration (or initial parameter for the first iteration) and the result of the current one
      context = (await getNextContext?.(context, result)) ?? context;
    }

    if (errors.length > 0) {
      throw new AggregateError(errors, "AggregateError");
    }

    if (postProcess) {
      return await postProcess?.(context, results);
    }

    return results as StepPipelineResult<T>;
  };
}
