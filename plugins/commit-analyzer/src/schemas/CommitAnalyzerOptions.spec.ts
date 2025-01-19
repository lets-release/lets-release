import { CommitAnalyzerOptions } from "src/schemas/CommitAnalyzerOptions";

describe("CommitAnalyzerOptions", () => {
  it("should validate commit analyzer options", () => {
    const obj = {
      releaseRules: [
        {
          release: "minor",
        },
      ],
    };

    expect(CommitAnalyzerOptions.parse(obj)).toEqual(obj);
  });
});
