import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";

export type ReleasingContext = Pick<
  NormalizedStepContext<Step.prepare>,
  "lastRelease" | "commits" | "nextRelease"
>;
