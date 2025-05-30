import {
  BranchType,
  Package,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeMainBranch } from "src/utils/branch/normalizeMainBranch";
import { normalizeNextBranch } from "src/utils/branch/normalizeNextBranch";
import { normalizeNextMajorBranch } from "src/utils/branch/normalizeNextMajorBranch";

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
const main: MatchBranchWithTags = {
  type: BranchType.main,
  name: "main",
  channels: { default: [null] },
  tags: {},
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
  tags: {
    a: [{ version: "1.0.0" }, { version: "1.2.3" }] as VersionTag[],
    b: [] as VersionTag[],
    c: [{ version: "3.0.0" }, { version: "3.2.3" }] as VersionTag[],
  },
};

describe("normalizeNextMajorBranch", () => {
  it("should not return branch if no next-major branch", () => {
    const { branch: normalizedMainBranch, latestSemVers: latestMainSemVers } =
      normalizeMainBranch(pkgs, main, next, nextMajor);
    const { branch: normalizedNextBranch, latestSemVers: latestNextSemVers } =
      normalizeNextBranch(
        pkgs,
        normalizedMainBranch!,
        latestMainSemVers,
        next,
        nextMajor,
      );

    expect(normalizeNextMajorBranch(pkgs, normalizedMainBranch!)).toEqual({
      latestSemVers: {},
    });
    expect(
      normalizeNextMajorBranch(
        pkgs,
        normalizedMainBranch!,
        normalizedNextBranch,
        { ...latestMainSemVers, ...latestNextSemVers },
      ),
    ).toEqual({
      latestSemVers: {},
    });
  });

  it("should normalize next-major branch with next branch", () => {
    const { branch: normalizedMainBranch, latestSemVers: latestMainSemVers } =
      normalizeMainBranch(pkgs, main, next, nextMajor);
    const { branch: normalizedNextBranch, latestSemVers: latestNextSemVers } =
      normalizeNextBranch(
        pkgs,
        normalizedMainBranch!,
        latestMainSemVers,
        next,
        nextMajor,
      );

    expect(
      normalizeNextMajorBranch(
        pkgs,
        normalizedMainBranch!,
        normalizedNextBranch,
        { ...latestMainSemVers, ...latestNextSemVers },
        nextMajor,
      ),
    ).toEqual({
      branch: {
        ...nextMajor,
        ranges: {
          a: {
            min: "2.0.0",
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
        a: "1.2.3",
        b: undefined,
        c: undefined,
      },
    });
  });

  it("should normalize next-major branch without next branch", () => {
    const { branch: normalizedMainBranch, latestSemVers: latestMainSemVers } =
      normalizeMainBranch(pkgs, main, undefined, nextMajor);

    expect(
      normalizeNextMajorBranch(
        pkgs,
        normalizedMainBranch!,
        undefined,
        latestMainSemVers,
        nextMajor,
      ),
    ).toEqual({
      branch: {
        ...nextMajor,
        ranges: {
          a: {
            min: "2.0.0",
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
        a: "1.2.3",
        b: undefined,
        c: undefined,
      },
    });
  });
});
