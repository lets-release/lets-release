import {
  BasePrereleaseOptions,
  ClassifiedPrereleaseOptions,
  CommonPrereleaseOptions,
  PrereleaseOptions,
} from "src/schemas/PrereleaseOptions";

describe("BasePrereleaseOptions", () => {
  it("should validate base prerelease options", () => {
    const obj = {
      channels: ["alpha", "beta", "rc"],
    };

    expect(BasePrereleaseOptions.parse(obj)).toEqual(obj);
  });
});

describe("CommonPrereleaseOptions", () => {
  it("should validate common prerelease options", () => {
    const obj = {
      name: "alpha",
    };

    expect(CommonPrereleaseOptions.parse(obj)).toEqual(obj);
  });
});

describe("ClassifiedPrereleaseOptions", () => {
  it("should validate classified prerelease options", () => {
    const obj = {
      names: {
        SemVer: "alpha",
        CalVer: "alpha",
      },
    };

    expect(ClassifiedPrereleaseOptions.parse(obj)).toEqual(obj);
  });
});

describe("PrereleaseOptions", () => {
  it("should validate prerelease options", () => {
    const obj = {
      names: {
        SemVer: "alpha",
        CalVer: "alpha",
      },
    };

    expect(PrereleaseOptions.parse(obj)).toEqual(obj);
  });
});
