import { BranchType } from "@lets-release/config";

import { filterParsedBranch } from "src/utils/branch/filterParsedBranch";

describe("filterParsedBranch", () => {
  it("should return true if branch name equals to pattern", () => {
    expect(
      filterParsedBranch(BranchType.maintenance, "1.x.x", {
        name: "1.x.x",
      }),
    ).toBe(true);
  });

  it("should return true if branch name matches pattern", () => {
    expect(
      filterParsedBranch(BranchType.maintenance, "+([0-9])?(.{+([0-9]),x}).x", {
        name: "1.x.x",
      }),
    ).toBe(true);
  });

  it("should return true if branch maintenance range matches pattern", () => {
    expect(
      filterParsedBranch(BranchType.maintenance, "+([0-9])?(.{+([0-9]),x}).x", {
        name: "maintenance",
        package: "test",
        range: "1.x.x",
      }),
    ).toBe(true);
  });

  it("should return false for other circumstances", () => {
    expect(
      filterParsedBranch(BranchType.maintenance, "1.x.x", {
        name: "test",
      }),
    ).toBe(false);
  });
});
