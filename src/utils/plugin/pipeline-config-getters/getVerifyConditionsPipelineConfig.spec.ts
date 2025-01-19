import { BaseContext } from "@lets-release/config";

import { getVerifyConditionsPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getVerifyConditionsPipelineConfig";

describe("getVerifyConditionsPipelineConfig", () => {
  it("should return verify conditions pipeline config", () => {
    expect(
      getVerifyConditionsPipelineConfig({}, {} as BaseContext["logger"]),
    ).toEqual({
      settleAll: true,
    });
  });
});
