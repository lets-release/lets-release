import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  ExecOptions
> = async (context, options) => {
  if (isNil(options.verifyConditionsCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  await exec("verifyConditionsCmd", context, options);
};
