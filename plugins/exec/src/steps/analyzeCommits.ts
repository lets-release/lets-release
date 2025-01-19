import { isNil } from "lodash-es";

import { ReleaseType, Step, StepFunction } from "@lets-release/config";

import { exec } from "src/helpers/exec";
import { ExecOptions } from "src/schemas/ExecOptions";

export const analyzeCommits: StepFunction<
  Step.analyzeCommits,
  ExecOptions
> = async (context, options) => {
  if (isNil(options.analyzeCommitsCmd)) {
    return;
  }

  await ExecOptions.parseAsync(options);

  const stdout = (await exec(
    "analyzeCommitsCmd",
    context,
    options,
  )) as ReleaseType;

  return stdout || undefined;
};
