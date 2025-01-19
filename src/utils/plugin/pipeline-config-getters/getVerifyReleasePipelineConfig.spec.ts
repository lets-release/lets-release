import { BaseContext } from "@lets-release/config";

import { getVerifyReleasePipelineConfig } from "src/utils/plugin/pipeline-config-getters/getVerifyReleasePipelineConfig";

describe("getVerifyReleasePipelineConfig", () => {
  it("should return verify release pipeline config", () => {
    expect(
      getVerifyReleasePipelineConfig({}, {} as BaseContext["logger"]),
    ).toEqual({
      settleAll: true,
    });
  });
});
