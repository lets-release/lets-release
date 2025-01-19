import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const prepare: StepFunction<Step.prepare, ExecOptions> = async (
  context,
  options,
) => {
  if (isNil(options.prepareCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  await exec("prepareCmd", context, options);
};
