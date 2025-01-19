import { Step } from "src/enums/Step";
import { StepContext } from "src/types/StepContext";
import { StepResult } from "src/types/StepResult";

export interface StepFunction<
  T extends Step = Step,
  U extends object = object,
> {
  pluginName?: string;
  (context: StepContext<T>, options: U): StepResult<T> | Promise<StepResult<T>>;
}
