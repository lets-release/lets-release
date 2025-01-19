import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const generateNotes: StepFunction<
  Step.generateNotes,
  ExecOptions
> = async (context, options) => {
  if (isNil(options.generateNotesCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  return await exec("generateNotesCmd", context, options);
};
