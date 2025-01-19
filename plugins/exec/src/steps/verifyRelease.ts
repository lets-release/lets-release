import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const verifyRelease: StepFunction<
  Step.verifyRelease,
  ExecOptions
> = async (context, options) => {
  if (isNil(options.verifyReleaseCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  await exec("verifyReleaseCmd", context, options);
};
