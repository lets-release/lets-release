import { ReleaseType } from "@lets-release/versioning";

import { AnalyzeCommitsResult } from "src/schemas/AnalyzeCommitsResult";

describe("AnalyzeCommitsResult", () => {
  it("should return analyze commits result", () => {
    expect(AnalyzeCommitsResult.parse(undefined)).toBeUndefined();

    expect(AnalyzeCommitsResult.parse(ReleaseType.major)).toBe(
      ReleaseType.major,
    );
  });

  it("should throw error for invalid analyze commits result", () => {
    expect(() => AnalyzeCommitsResult.parse(null)).toThrowError();
  });
});
