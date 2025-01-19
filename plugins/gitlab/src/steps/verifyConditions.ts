import { Step, StepFunction } from "@lets-release/config";

import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { GitLabOptions } from "src/schemas/GitLabOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  GitLabOptions
> = async (context, options) => {
  await ensureGitLabContext(context, options);
};
