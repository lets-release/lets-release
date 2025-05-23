import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const success: StepFunction<Step.success, ExecOptions> = async (
  context,
  options,
) => {
  if (isNil(options.successCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  await exec("successCmd", context, options);
};
