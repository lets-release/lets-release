import debug from "debug";
import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { name } from "src/plugin";
import { ExecOptions } from "src/schemas/ExecOptions";

export const findPackages: StepFunction<
  Step.findPackages,
  ExecOptions
> = async (context, options) => {
  if (isNil(options.findPackagesCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  const stdout = await exec("findPackagesCmd", context, options);

  try {
    return stdout ? JSON.parse(stdout) : undefined;
  } catch (error) {
    debug(name)(stdout);
    debug(name)(error);
    debug(name)(
      `The command ${options.findPackagesCmd} wrote invalid JSON to stdout. The stdout content will be ignored.`,
    );
  }
};
