import debug from "debug";
import { isNil } from "lodash-es";

import { ReleaseResult, Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { name } from "src/plugin";
import { ExecOptions } from "src/schemas/ExecOptions";

export const publish: StepFunction<Step.publish, ExecOptions> = async (
  context,
  options,
) => {
  if (isNil(options.publishCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  const stdout = await exec("publishCmd", context, options);

  try {
    return stdout ? (JSON.parse(stdout) as ReleaseResult) : undefined;
  } catch (error) {
    const namespace = `${name}:${context.package.uniqueName}`;

    debug(namespace)(stdout);
    debug(namespace)(error);
    debug(namespace)(
      `The command ${
        options.publishCmd
      } wrote invalid JSON to stdout. The stdout content will be ignored.`,
    );
  }
};
