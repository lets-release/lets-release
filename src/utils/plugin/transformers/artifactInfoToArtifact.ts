import { Step } from "@lets-release/config";

import { StepResultTransformer } from "src/types/StepResultTransformer";

export const artifactInfoToArtifact: StepResultTransformer<Step.addChannels> &
  StepResultTransformer<Step.publish> = (
  { nextRelease },
  { pluginName },
  artifact,
) =>
  // Add `nextRelease` and plugin name to published release
  artifact
    ? {
        ...artifact,
        pluginName,
        channels:
          nextRelease.channels[pluginName] ?? nextRelease.channels.default,
      }
    : undefined;
