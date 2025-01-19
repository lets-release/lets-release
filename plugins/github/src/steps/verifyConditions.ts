import { Step, StepFunction } from "@lets-release/config";

import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { GitHubOptions } from "src/schemas/GitHubOptions";

export const verifyConditions: StepFunction<
  Step.verifyConditions,
  GitHubOptions
> = async (context, options) => {
  await ensureGitHubContext(context, options);
};
