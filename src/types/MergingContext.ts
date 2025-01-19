import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";

export type MergingContext = Pick<
  NormalizedStepContext<Step.addChannels>,
  "lastRelease" | "currentRelease" | "nextRelease"
>;
