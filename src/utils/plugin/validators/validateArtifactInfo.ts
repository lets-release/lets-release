import { ReleaseResult, Step } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { StepResultValidator } from "src/types/StepResultValidator";

export const validateArtifactInfo: StepResultValidator<Step.addChannels> &
  StepResultValidator<Step.publish> = async (context, pluginName, result) => {
  try {
    await ReleaseResult.parseAsync(result);
  } catch (error) {
    throw new InvalidStepResultError(
      Step.addChannels,
      pluginName,
      result,
      error,
      context.package,
    );
  }
};
