import { BaseContext } from "@lets-release/config";

import { getSuccessPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getSuccessPipelineConfig";
import { preProcessSuccessContext } from "src/utils/plugin/pre-processors/preProcessSuccessContext";

describe("getSuccessPipelineConfig", () => {
  it("should return success pipeline config", () => {
    expect(getSuccessPipelineConfig({}, {} as BaseContext["logger"])).toEqual({
      settleAll: true,
      preProcess: preProcessSuccessContext,
    });
  });
});
