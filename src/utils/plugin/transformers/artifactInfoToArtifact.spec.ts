import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { artifactInfoToArtifact } from "src/utils/plugin/transformers/artifactInfoToArtifact";

describe("artifactInfoToArtifact", () => {
  it("should add pluginName and channels to the artifact", () => {
    const nextRelease = {
      channels: {
        pluginA: ["channel1", "channel2"],
        default: ["defaultChannel"],
      },
    };
    const pluginName = "pluginA";
    const artifact = { name: "artifact1" };

    const result = artifactInfoToArtifact(
      { nextRelease } as unknown as NormalizedStepContext<Step.addChannels>,
      { pluginName } as unknown as NormalizedStepFunction<Step.addChannels>,
      artifact,
    );

    expect(result).toEqual({
      name: "artifact1",
      pluginName: "pluginA",
      channels: ["channel1", "channel2"],
    });
  });

  it("should use default channels if plugin channels are not defined", () => {
    const nextRelease = {
      channels: {
        default: ["defaultChannel"],
      },
    };
    const pluginName = "pluginB";
    const artifact = { name: "artifact2" };

    const result = artifactInfoToArtifact(
      { nextRelease } as unknown as NormalizedStepContext<Step.addChannels>,
      { pluginName } as unknown as NormalizedStepFunction<Step.addChannels>,
      artifact,
    );

    expect(result).toEqual({
      name: "artifact2",
      pluginName: "pluginB",
      channels: ["defaultChannel"],
    });
  });

  it("should return undefined if artifact is undefined", () => {
    const nextRelease = {
      channels: {
        pluginA: ["channel1", "channel2"],
        default: ["defaultChannel"],
      },
    };
    const pluginName = "pluginA";
    const artifact = undefined;

    const result = artifactInfoToArtifact(
      { nextRelease } as unknown as NormalizedStepContext<Step.addChannels>,
      { pluginName } as unknown as NormalizedStepFunction<Step.addChannels>,
      artifact,
    );

    expect(result).toBeUndefined();
  });
});
