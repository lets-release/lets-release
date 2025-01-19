import { Step, StepContext } from "@lets-release/config";

export type StepResultValidator<T extends Step = Step> = (
  context: StepContext<T>,
  pluginName: string,
  result: unknown,
) => void | Promise<void>;
