import {
  BranchType,
  Package,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedVersioningPrereleaseOptions } from "@lets-release/versioning";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeMainBranch } from "src/utils/branch/normalizeMainBranch";
import { normalizeNextBranch } from "src/utils/branch/normalizeNextBranch";

const prerelease: NormalizedVersioningPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
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
const main: MatchBranchWithTags = {
  type: BranchType.main,
  name: "main",
  channels: { default: [null] },
  tags: {
    a: [{ version: "1.0.0" }, { version: "1.2.3" }] as VersionTag[],
    b: [] as VersionTag[],
    c: [{ version: "3.0.0" }, { version: "3.2.3" }] as VersionTag[],
  },
};
const next: MatchBranchWithTags = {
  type: BranchType.next,
  name: "next",
  channels: { default: ["next"] },
  tags: {},
};
const nextMajor: MatchBranchWithTags = {
  type: BranchType.nextMajor,
  name: "next-major",
  channels: { default: ["next-major"] },
  tags: {},
};

describe("normalizeNextBranch", () => {
  it("should not return branch if next branch is not provided", () => {
    const { branch: normalizedMainBranch, latestSemVers: latestMainSemVers } =
      normalizeMainBranch(pkgs, main, next, nextMajor);

    expect(
      normalizeNextBranch(pkgs, normalizedMainBranch!, latestMainSemVers),
    ).toEqual({
      latestSemVers: {},
    });
  });

  it("should normalize next branch without next-major branch", () => {
    const { branch: normalizedMainBranch, latestSemVers: latestMainSemVers } =
      normalizeMainBranch(pkgs, main, next);
    const tags = {
      a: [{ version: "2.0.0" }, { version: "2.2.3" }] as VersionTag[],
      b: [] as VersionTag[],
      c: [{ version: "4.0.0" }, { version: "4.2.3" }] as VersionTag[],
    };

    expect(
      normalizeNextBranch(pkgs, normalizedMainBranch!, latestMainSemVers, {
        ...next,
        tags,
      }),
    ).toEqual({
      branch: {
        ...next,
        tags,
        ranges: {
          a: {
            min: "2.2.4",
            max: undefined,
          },
          b: {
            min: "2.0.0",
            max: undefined,
          },
          c: undefined,
        },
      },
      latestSemVers: {
        a: "2.2.3",
        b: undefined,
        c: undefined,
      },
    });
  });

  it("should normalize next branch with next-major branch", () => {
    const { branch: normalizedMainBranch, latestSemVers: latestMainSemVers } =
      normalizeMainBranch(pkgs, main, next, nextMajor);
    const tags = {
      a: [{ version: "1.3.0" }, { version: "1.4.3" }] as VersionTag[],
      b: [] as VersionTag[],
      c: [{ version: "4.0.0" }, { version: "4.2.3" }] as VersionTag[],
    };

    expect(
      normalizeNextBranch(
        pkgs,
        normalizedMainBranch!,
        latestMainSemVers,
        { ...next, tags },
        {
          ...nextMajor,
          tags: {},
        },
      ),
    ).toEqual({
      branch: {
        ...next,
        tags,
        ranges: {
          a: {
            min: "1.4.4",
            max: "2.0.0",
          },
          b: {
            min: "1.1.0",
            max: "2.0.0",
          },
          c: undefined,
        },
      },
      latestSemVers: {
        a: "1.4.3",
        b: undefined,
        c: undefined,
      },
    });
  });
});
