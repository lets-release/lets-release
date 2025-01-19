import {
  BaseBranchObject,
  MaintenanceBranchObject,
  PrereleaseBranchObject,
  ReleaseBranchObject,
} from "src/schemas/BranchObject";

describe("BaseBranchObject", () => {
  it("should validate base branch object", () => {
    const obj = {
      name: "name",
    };

    expect(BaseBranchObject.parse(obj)).toEqual(obj);
  });
});

describe("ReleaseBranchObject", () => {
  it("should validate release branch object", () => {
    const obj = {
      name: "name",
      channels: [null],
    };

    expect(ReleaseBranchObject.parse(obj)).toEqual(obj);
  });
});

describe("MaintenanceBranchObject", () => {
  it("should validate maintenance branch object", () => {
    const obj = {
      name: "name",
      ranges: { "lets-release": "24.0.x" },
    };

    expect(MaintenanceBranchObject.parse(obj)).toEqual(obj);
  });
});

describe("PrereleaseBranchObject", () => {
  it("should validate prerelease branch object", () => {
    const obj = {
      name: "name",
      prerelease: {
        name: "alpha",
      },
    };

    expect(PrereleaseBranchObject.parse(obj)).toEqual(obj);
  });
});
