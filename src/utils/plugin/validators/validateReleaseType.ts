import { AnalyzeCommitsResult, Step } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { StepResultValidator } from "src/types/StepResultValidator";

export const validateReleaseType: StepResultValidator<
  Step.analyzeCommits
> = async (context, pluginName, result) => {
  try {
    await AnalyzeCommitsResult.parseAsync(result);
  } catch (error) {
    throw new InvalidStepResultError(
      Step.analyzeCommits,
      pluginName,
      result,
      error,
      context.package,
    );
  }
};
