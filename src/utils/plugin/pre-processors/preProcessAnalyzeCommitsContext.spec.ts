import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { preProcessAnalyzeCommitsContext } from "src/utils/plugin/pre-processors/preProcessAnalyzeCommitsContext";

describe("preProcessAnalyzeCommitsContext", () => {
  it("should pre process analyze commits context", () => {
    expect(
      preProcessAnalyzeCommitsContext({
        commits: [
          { message: "test" },
          { message: "[skip release] test" },
          { message: "[release skip] test" },
        ],
      } as NormalizedStepContext<Step.analyzeCommits>),
    ).toEqual({
      commits: [{ message: "test" }],
    });
  });
});
