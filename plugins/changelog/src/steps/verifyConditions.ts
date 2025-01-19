import { Step, StepFunction } from "@lets-release/config";

import { ChangelogOptions } from "src/schemas/ChangelogOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  ChangelogOptions
> = async (_, options) => {
  await ChangelogOptions.parseAsync(options);
};
