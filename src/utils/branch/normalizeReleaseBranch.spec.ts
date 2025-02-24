import { BranchType, Package, VersioningScheme } from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeReleaseBranch } from "src/utils/branch/normalizeReleaseBranch";

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const pkgs: Package[] = [
  {
    path: "/path/to/a",
    type: "npm",
    name: "a",
    uniqueName: "a",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    path: "/path/to/b",
    type: "npm",
    name: "b",
    uniqueName: "b",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    path: "/path/to/c",
    type: "npm",
    name: "c",
    uniqueName: "c",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.CalVer,
      format: "YY.MINOR.MICRO",
      prerelease,
    },
  },
];

describe("normalizeReleaseBranch", () => {
  it("should skip if branch is not provided", () => {
    expect(normalizeReleaseBranch(pkgs, { type: BranchType.main })).toEqual({
      latestSemVers: {},
    });
  });

  it("should normalize release branch if first next semver is less than min version", () => {
    expect(
      normalizeReleaseBranch(pkgs, {
        type: BranchType.main,
        branch: {
          tags: {
            a: [],
          },
        } as unknown as MatchBranchWithTags<BranchType.main>,
        lowerSemVers: {
          a: "2.0.0",
        },
        getFirstNextSemVer: (pkg) => (pkg.name === "a" ? "2.0.0" : undefined),
        getUpperBound: () => "3.0.0",
      }),
    ).toEqual({
      branch: {
        type: BranchType.main,
        ranges: {
          a: undefined,
          b: {
            min: "1.0.0",
            max: "3.0.0",
          },
          c: undefined,
        },
        tags: {
          a: [],
        },
      },
      latestSemVers: {
        a: "2.0.0",
        b: undefined,
        c: undefined,
      },
    });
  });

  it("should normalize release branch if first next semver is equal to min version", () => {
    expect(
      normalizeReleaseBranch(pkgs, {
        type: BranchType.main,
        branch: {
          tags: {
            a: [],
          },
        } as unknown as MatchBranchWithTags<BranchType.main>,
        lowerSemVers: {},
        getFirstNextSemVer: (pkg) => (pkg.name === "a" ? "1.0.0" : undefined),
        getUpperBound: () => "3.0.0",
      }),
    ).toEqual({
      branch: {
        type: BranchType.main,
        ranges: {
          a: undefined,
          b: {
            min: "1.0.0",
            max: "3.0.0",
          },
          c: undefined,
        },
        tags: {
          a: [],
        },
      },
      latestSemVers: {
        a: undefined,
        b: undefined,
        c: undefined,
      },
    });
  });

  it("should normalize release branch", () => {
    expect(
      normalizeReleaseBranch(pkgs, {
        type: BranchType.main,
        branch: {
          tags: {
            a: [],
          },
        } as unknown as MatchBranchWithTags<BranchType.main>,
        lowerSemVers: {
          a: "1.3.0",
        },
        getFirstNextSemVer: (pkg) => (pkg.name === "a" ? "3.0.0" : undefined),
        getUpperBound: () => "2.0.0",
      }),
    ).toEqual({
      branch: {
        type: BranchType.main,
        ranges: {
          a: {
            min: "1.3.1",
            max: "2.0.0",
          },
          b: {
            min: "1.0.0",
            max: "2.0.0",
          },
          c: undefined,
        },
        tags: {
          a: [],
        },
      },
      latestSemVers: {
        a: "1.3.0",
        b: undefined,
        c: undefined,
      },
    });
  });
});
