import { ReleaseType, Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { postProcessAnalyzeCommitsResults } from "src/utils/plugin/post-processors/postProcessAnalyzeCommitsResults";

describe("postProcessAnalyzeCommitsResults", () => {
  it("should post process analyze commits results", () => {
    expect(
      postProcessAnalyzeCommitsResults(
        {} as NormalizedStepContext<Step.analyzeCommits>,
        [
          ReleaseType.patch,
          undefined,
          ReleaseType.minor,
          undefined,
          ReleaseType.major,
          ReleaseType.patch,
        ],
      ),
    ).toBe(ReleaseType.major);
  });
});
