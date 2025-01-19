import { BaseContext } from "@lets-release/config";

import { getAnalyzeCommitsPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getAnalyzeCommitsPipelineConfig";
import { postProcessAnalyzeCommitsResults } from "src/utils/plugin/post-processors/postProcessAnalyzeCommitsResults";
import { preProcessAnalyzeCommitsContext } from "src/utils/plugin/pre-processors/preProcessAnalyzeCommitsContext";

describe("getAnalyzeCommitsPipelineConfig", () => {
  it("should return analyze commits pipeline config", () => {
    expect(
      getAnalyzeCommitsPipelineConfig({}, {} as BaseContext["logger"]),
    ).toEqual({
      preProcess: preProcessAnalyzeCommitsContext,
      postProcess: postProcessAnalyzeCommitsResults,
    });
  });
});
