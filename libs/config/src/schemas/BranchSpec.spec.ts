import {
  MaintenanceBranchSpec,
  PrereleaseBranchSpec,
  ReleaseBranchSpec,
} from "src/schemas/BranchSpec";

describe("ReleaseBranchSpec", () => {
  it("should validate release branch spec", async () => {
    expect(ReleaseBranchSpec.parse("main")).toBe("main");
  });
});

describe("MaintenanceBranchSpec", () => {
  it("should validate maintenance branch spec", async () => {
    expect(MaintenanceBranchSpec.parse("main")).toBe("main");
  });
});

describe("PrereleaseBranchSpec", () => {
  it("should validate prerelease branch spec", async () => {
    expect(PrereleaseBranchSpec.parse("main")).toBe("main");
  });
});
