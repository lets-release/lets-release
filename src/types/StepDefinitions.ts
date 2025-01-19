import { Step } from "@lets-release/config";

import { StepDefinition } from "src/types/StepDefinition";

export type StepDefinitions = {
  [S in Step]: StepDefinition<S>;
};
