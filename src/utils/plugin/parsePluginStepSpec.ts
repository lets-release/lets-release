import { isArray } from "lodash-es";

import { PluginStepSpec, Step, StepFunction } from "@lets-release/config";

export function parsePluginStepSpec<
  T extends Step = Step,
  U extends object = object,
>(spec: PluginStepSpec<T, U>): [string | StepFunction<T, U>, U] {
  let plugin: string | StepFunction<T, U>;
  let options: U | undefined;

  if (isArray(spec)) {
    [plugin, options] = spec;
  } else {
    plugin = spec as StepFunction<T, U>;
  }

  return [plugin, options ?? ({} as U)];
}
