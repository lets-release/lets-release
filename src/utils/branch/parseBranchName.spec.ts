import { parseBranchName } from "src/utils/branch/parseBranchName";

describe("parseBranchName", () => {
  it("should return package and range for maintenance branch name", () => {
    expect(parseBranchName("package/range", ["package"])).toEqual({
      package: "package",
      range: "range",
    });
  });

  it("should return range for maintenance branch name without package name", () => {
    expect(parseBranchName("range", ["package"])).toEqual({
      range: "range",
    });
  });

  it("should return branch name as range for non-maintenance branch name", () => {
    expect(parseBranchName("any")).toEqual({
      range: "any",
    });
  });
});
