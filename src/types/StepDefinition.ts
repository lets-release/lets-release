import { PluginStepSpec, Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { StepResultValidator } from "src/types/StepResultValidator";

export interface StepDefinition<T extends Step = Step> {
  required?: boolean;
  dryRunnable?: boolean;
  defaultSpecs?: PluginStepSpec<T>[];
  validate?: StepResultValidator<T>;
  getPipelineConfig?: StepPipelineConfigGetter<T>;
}
