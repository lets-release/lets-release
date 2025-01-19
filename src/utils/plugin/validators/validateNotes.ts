import { GenerateNotesResult, Step } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { StepResultValidator } from "src/types/StepResultValidator";

export const validateNotes: StepResultValidator<Step.generateNotes> = async (
  context,
  pluginName,
  result,
) => {
  try {
    await GenerateNotesResult.parseAsync(result);
  } catch (error) {
    throw new InvalidStepResultError(
      Step.generateNotes,
      pluginName,
      result,
      error,
      context.package,
    );
  }
};
