import { BranchObject, BranchType, Package } from "@lets-release/config";

import { flatMapParsedBranch } from "src/utils/branch/flatMapParsedBranch";

const packages = [
  {
    name: "a",
    uniqueName: "npm/a",
    versioning: {
      scheme: "SemVer",
    },
  },
  {
    name: "b",
    uniqueName: "npm/b",
    versioning: {
      scheme: "CalVer",
      format: "YYYY.MINOR.MICRO",
    },
  },
] as Package[];

describe("flatMapParsedBranch", () => {
  it("should return empty prerelease branches if can not normalize prerelease options", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.prerelease,
        {
          name: "alpha/1.x.x",
          prerelease: undefined,
        } as unknown as BranchObject<BranchType.prerelease>,
        {
          name: "alpha/1.x.x",
        },
      ),
    ).toEqual([]);
  });

  it("should return prerelease branches without prerelease options", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.prerelease,
        {
          name: "alpha",
          prerelease: undefined,
        } as unknown as BranchObject<BranchType.prerelease>,
        {
          name: "alpha",
        },
      ),
    ).toEqual([
      {
        type: BranchType.prerelease,
        name: "alpha",
        prerelease: {
          name: { default: "alpha" },
          channels: { default: ["alpha"] },
        },
      },
    ]);
  });

  it("should return prerelease branches", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.prerelease,
        {
          name: "alpha",
          prerelease: { name: true },
        } as unknown as BranchObject<BranchType.prerelease>,
        {
          name: "alpha",
        },
      ),
    ).toEqual([
      {
        type: BranchType.prerelease,
        name: "alpha",
        prerelease: {
          name: { default: "alpha" },
          channels: { default: ["alpha"] },
        },
      },
    ]);
  });

  it("should return main branches", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.main,
        {
          name: "(main|master)",
          prereleases: {
            alpha: {
              name: "alpha",
              channels: ["alpha"],
            },
          },
        } as unknown as BranchObject<BranchType.main>,
        {
          name: "main",
        },
      ),
    ).toEqual([
      {
        type: BranchType.main,
        name: "main",
        channels: { default: [null] },
        prereleases: {
          alpha: {
            name: { default: "alpha" },
            channels: { default: ["alpha"] },
          },
        },
      },
    ]);
  });

  it("should return other release branches", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.next,
        {
          name: "next",
        } as unknown as BranchObject<BranchType.next>,
        {
          name: "next",
        },
      ),
    ).toEqual([
      {
        type: BranchType.next,
        name: "next",
        channels: { default: ["next"] },
        prereleases: undefined,
      },
    ]);
  });

  it("should return empty array for maintenance branch without valid ranges", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.maintenance,
        {
          name: "+([0-9])?(.{+([0-9]),x}).x",
        } as unknown as BranchObject<BranchType.maintenance>,
        {
          name: "c/1.x.x",
          package: "c",
          range: "1.x.x",
        },
      ),
    ).toHaveLength(0);

    expect(
      flatMapParsedBranch(
        packages,
        BranchType.maintenance,
        {
          name: "+([0-9])?(.{+([0-9]),x}).x",
        } as unknown as BranchObject<BranchType.maintenance>,
        {
          name: "c/1.x.x",
        },
      ),
    ).toHaveLength(0);
  });

  it("should return semver maintenance branches", () => {
    expect(
      flatMapParsedBranch(
        packages,
        BranchType.maintenance,
        {
          name: "+([0-9])?(.{+([0-9]),x}).x",
        } as unknown as BranchObject<BranchType.maintenance>,
        {
          name: "npm/a/1.x.x",
          package: "npm/a",
          range: "1.x.x",
        },
      ),
    ).toEqual([
      {
        type: BranchType.maintenance,
        name: "npm/a/1.x.x",
        channels: { default: ["npm/a/1.x.x"] },
        prereleases: undefined,
        ranges: {
          "npm/a": "1.x.x",
        },
      },
    ]);
  });

  it("should return calver maintenance branches", () => {
    expect(
      flatMapParsedBranch(
        [
          {
            main: true,
            name: "b",
            uniqueName: "npm/b",
            versioning: {
              scheme: "CalVer",
              format: "YYYY.MINOR.MICRO",
            },
          },
        ] as Package[],
        BranchType.maintenance,
        {
          name: "+(+([0-9])[._-])?(x[._-])x",
          ranges: undefined,
        } as unknown as BranchObject<BranchType.maintenance>,
        {
          name: "maintenance",
          range: "2023.x.x",
        },
      ),
    ).toEqual([
      {
        type: BranchType.maintenance,
        name: "maintenance",
        channels: { default: ["maintenance"] },
        prereleases: undefined,
        ranges: {
          "npm/b": "2023.x.x",
        },
      },
    ]);
  });
});
