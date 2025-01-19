import { BaseContext } from "@lets-release/config";

import { getFailPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getFailPipelineConfig";
import { preProcessFailContext } from "src/utils/plugin/pre-processors/preProcessFailContext";

describe("getFailPipelineConfig", () => {
  it("should return fail pipeline config", () => {
    expect(getFailPipelineConfig({}, {} as BaseContext["logger"])).toEqual({
      settleAll: true,
      preProcess: preProcessFailContext,
    });
  });
});
