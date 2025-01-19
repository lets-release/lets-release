import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const fail: StepFunction<Step.fail, ExecOptions> = async (
  context,
  options,
) => {
  if (isNil(options.failCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  await exec("failCmd", context, options);
};
