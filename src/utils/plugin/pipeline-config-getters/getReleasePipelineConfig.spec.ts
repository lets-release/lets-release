import { BaseContext } from "@lets-release/config";

import { getReleasePipelineConfig } from "src/utils/plugin/pipeline-config-getters/getReleasePipelineConfig";
import { postProcessReleaseResults } from "src/utils/plugin/post-processors/postProcessReleaseResults";
import { artifactInfoToArtifact } from "src/utils/plugin/transformers/artifactInfoToArtifact";

describe("getReleasePipelineConfig", () => {
  it("should return release pipeline config", () => {
    expect(getReleasePipelineConfig({}, {} as BaseContext["logger"])).toEqual({
      transform: artifactInfoToArtifact,
      postProcess: postProcessReleaseResults,
    });
  });
});
