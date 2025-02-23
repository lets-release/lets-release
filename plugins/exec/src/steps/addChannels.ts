import debug from "debug";
import { isNil } from "lodash-es";

import { Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { name } from "src/plugin";
import { ExecOptions } from "src/schemas/ExecOptions";

export const addChannels: StepFunction<Step.addChannels, ExecOptions> = async (
  context,
  options,
) => {
  if (isNil(options.addChannelsCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  const stdout = await exec("addChannelsCmd", context, options);

  try {
    return stdout ? JSON.parse(stdout) : undefined;
  } catch (error) {
    const namespace = `${name}:${context.package.uniqueName}`;

    debug(namespace)(stdout);
    debug(namespace)(error);
    debug(namespace)(
      `The command ${options.addChannelsCmd} wrote invalid JSON to stdout. The stdout content will be ignored.`,
    );
  }
};
