import {
  BranchType,
  Package,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeMainBranch } from "src/utils/branch/normalizeMainBranch";

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

describe("normalizeMainBranch", () => {
  it("should normalize main branch", () => {
    expect(normalizeMainBranch(pkgs, main)).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
          },
          b: {
            min: "1.0.0",
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

  it("should normalize main branch if next branch has version less than max version of main branch", () => {
    expect(
      normalizeMainBranch(pkgs, main, {
        ...next,
        tags: {
          a: [{ version: "1.9.0" }, { version: "2.2.3" }] as VersionTag[],
        },
      }),
    ).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
            max: "1.9.0",
          },
          b: {
            min: "1.0.0",
            max: "2.0.0",
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

  it("should normalize main branch if all versions in next branch are greater than max version of main branch", () => {
    expect(
      normalizeMainBranch(pkgs, main, {
        ...next,
        tags: {
          a: [{ version: "2.9.0" }, { version: "2.2.3" }] as VersionTag[],
        },
      }),
    ).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
            max: "2.0.0",
          },
          b: {
            min: "1.0.0",
            max: "2.0.0",
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

  it("should normalize main branch if earliest version of next branch is less than min version of main branch", () => {
    expect(
      normalizeMainBranch(pkgs, main, {
        ...next,
        tags: {
          a: [{ version: "1.2.3" }, { version: "2.2.3" }] as VersionTag[],
        },
      }),
    ).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
            max: "2.0.0",
          },
          b: {
            min: "1.0.0",
            max: "2.0.0",
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

  it("should normalize main branch if earliest version of next branch is equal to min version of main branch", () => {
    expect(
      normalizeMainBranch(pkgs, main, {
        ...next,
        tags: {
          a: [{ version: "1.2.4" }, { version: "2.2.3" }] as VersionTag[],
        },
      }),
    ).toEqual({
      branch: {
        ...main,
        ranges: {
          a: undefined,
          b: {
            min: "1.0.0",
            max: "2.0.0",
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

  it("should normalize main branch with next-major branch, if next branch has version less than max version of main branch", () => {
    expect(
      normalizeMainBranch(
        pkgs,
        main,
        {
          ...next,
          tags: {
            a: [{ version: "1.2.10" }, { version: "2.2.3" }] as VersionTag[],
          },
        },
        nextMajor,
      ),
    ).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
            max: "1.2.10",
          },
          b: {
            min: "1.0.0",
            max: "1.1.0",
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

  it("should normalize main branch with next-major branch if all versions in next branch are greater than max version of main branch", () => {
    expect(
      normalizeMainBranch(
        pkgs,
        main,
        {
          ...next,
          tags: {
            a: [{ version: "1.10.0" }, { version: "2.2.3" }] as VersionTag[],
          },
        },
        nextMajor,
      ),
    ).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
            max: "1.3.0",
          },
          b: {
            min: "1.0.0",
            max: "1.1.0",
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

  it("should normalize main branch with next-major and without next branch", () => {
    expect(normalizeMainBranch(pkgs, main, undefined, nextMajor)).toEqual({
      branch: {
        ...main,
        ranges: {
          a: {
            min: "1.2.4",
            max: "2.0.0",
          },
          b: {
            min: "1.0.0",
            max: "2.0.0",
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
