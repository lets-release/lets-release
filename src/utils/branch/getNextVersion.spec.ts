import {
  BranchType,
  ReleaseType,
  Step,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { InvalidNextVersionError } from "src/errors/InvalidNextVersionError";
import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getBuildMetadata } from "src/utils/branch/getBuildMetadata";
import { getNextVersion } from "src/utils/branch/getNextVersion";
import { getPluginPrereleaseName } from "src/utils/branch/getPluginPrereleaseName";

vi.mock("src/utils/branch/getBuildMetadata");
vi.mock("src/utils/branch/getPluginPrereleaseName");

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const prereleaseBranch = {
  type: BranchType.prerelease,
  tags: {},
};
const logger = { log: vi.fn() };
const branches = {
  main: {
    name: "main",
    type: BranchType.main,
    ranges: {
      "npm/semver": {
        min: "2.0.0",
      },
      "npm/calver": {
        min: "2.0.0",
      },
    },
    tags: {},
  },
  maintenance: [
    {
      ranges: {
        "npm/semver": {
          min: "1.1.0",
        },
        "npm/calver": {
          min: "1.1.0",
        },
      },
      tags: {},
    },
  ],
};
const context = {
  logger,
  branches,
  commits: [],
};
const hash = "abc123";
const alpha = "alpha";
const build = "build";

vi.mocked(getPluginPrereleaseName).mockReturnValue(alpha);
vi.mocked(getBuildMetadata).mockReturnValue(build);

describe("getNextVersion", () => {
  describe("semver", () => {
    const versioning = {
      scheme: VersioningScheme.SemVer,
      prerelease,
      build: true,
    };
    const pkg = {
      name: "semver",
      uniqueName: "npm/semver",
      versioning,
    };
    const prereleaseBranchCtx = {
      ...context,
      options: {},
      branch: prereleaseBranch,
      package: pkg,
    };
    const releaseBranchPrereleaseCtx = {
      ...context,
      options: { prerelease: alpha },
      branch: branches.main,
      package: pkg,
    };
    const releaseBranchCtx = {
      ...context,
      options: {},
      branch: branches.main,
      package: pkg,
    };
    const prereleasePatchVersionsWithoutBuild = [
      [undefined, "2.0.0-alpha.1"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2"],
      ["2.0.0", "2.0.1-alpha.1"],
    ];
    const prereleasePatchVersions = [
      [undefined, "2.0.0-alpha.1+build"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2+build"],
      ["2.0.0", "2.0.1-alpha.1+build"],
    ];
    const prereleaseMinorVersions = [
      [undefined, "2.0.0-alpha.1+build"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2+build"],
      ["2.0.1-alpha.1", "2.1.0-alpha.1+build"],
      ["2.0.0", "2.1.0-alpha.1+build"],
    ];
    const prereleaseMajorVersions = [
      [undefined, "2.0.0-alpha.1+build"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2+build"],
      ["2.0.1-alpha.1", "3.0.0-alpha.1+build"],
      ["2.0.0", "3.0.0-alpha.1+build"],
    ];

    it("should return undefined if no version range on non-prerelease branch", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            branch: {
              name: "main",
              type: BranchType.main,
              ranges: {},
              tags: {},
            },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBeUndefined();
    });

    it("should get next patch prerelease version without build metadata for prerelease branch", () => {
      for (const [version, next] of prereleasePatchVersionsWithoutBuild) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              package: {
                ...pkg,
                versioning: {
                  ...versioning,
                  build: undefined,
                },
              },
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.patch,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next patch prerelease version for prerelease branch", () => {
      for (const [version, next] of prereleasePatchVersions) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.patch,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next minor prerelease version for prerelease branch", () => {
      for (const [version, next] of prereleaseMinorVersions) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.minor,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next major prerelease version for prerelease branch", () => {
      for (const [version, next] of prereleaseMajorVersions) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.major,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next patch prerelease version for release branch", () => {
      for (const [version, next] of prereleasePatchVersions) {
        expect(
          getNextVersion(
            {
              ...releaseBranchPrereleaseCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.patch,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next minor prerelease version for release branch", () => {
      for (const [version, next] of prereleaseMinorVersions) {
        expect(
          getNextVersion(
            {
              ...releaseBranchPrereleaseCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.minor,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next major prerelease version for release branch", () => {
      for (const [version, next] of prereleaseMajorVersions) {
        expect(
          getNextVersion(
            {
              ...releaseBranchPrereleaseCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.major,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next patch version for release branch if no last release found", () => {
      expect(
        getNextVersion(
          releaseBranchCtx as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next patch version for release branch if last release found", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBe("2.0.1");
    });

    it("should get next patch version for release branch if last release is prerelease", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0-alpha.1" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next minor version for release branch if no last release found", () => {
      expect(
        getNextVersion(
          releaseBranchCtx as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next minor version for release branch if last release found", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toBe("2.1.0");
    });

    it("should get next minor version for release branch if last release is prerelease", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0-alpha.1" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next major version for release branch if no last release found", () => {
      expect(
        getNextVersion(
          releaseBranchCtx as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next major version for release branch if last release found", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe("3.0.0");
    });

    it("should get next major version for release branch if last release is prerelease", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0-alpha.1" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should throw error if version is not in range", () => {
      expect(() =>
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "1.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toThrow(InvalidNextVersionError);

      expect(() =>
        getNextVersion(
          {
            ...releaseBranchCtx,
            branch: { ...branches.main, type: BranchType.next },
            lastRelease: { version: "1.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toThrow(InvalidNextVersionError);
    });

    it("should return undefined if there is no initial version", () => {
      expect(
        getNextVersion(
          {
            ...prereleaseBranchCtx,
            branches: {
              main: {
                name: "main",
                type: BranchType.main,
                ranges: {},
                tags: {},
              },
            },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBeUndefined();
    });
  });

  describe("calver", () => {
    const format = "YY.MINOR.MICRO";
    const versioning = {
      scheme: VersioningScheme.CalVer,
      format,
      prerelease,
      build: true,
    };
    const pkg = {
      name: "calver",
      uniqueName: "npm/calver",
      versioning,
    };
    const prereleaseBranchCtx = {
      ...context,
      options: {},
      branch: prereleaseBranch,
      package: pkg,
    };
    const releaseBranchPrereleaseCtx = {
      ...context,
      options: { prerelease: alpha },
      branch: branches.main,
      package: pkg,
    };
    const releaseBranchCtx = {
      ...context,
      options: {},
      branch: branches.main,
      package: pkg,
    };
    const prereleasePatchVersionsWithoutBuild = [
      [undefined, "2.0.0-alpha.1"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2"],
      ["2.0.0", "2.0.1-alpha.1"],
    ];
    const prereleasePatchVersions = [
      [undefined, "2.0.0-alpha.1+build"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2+build"],
      ["2.0.0", "2.0.1-alpha.1+build"],
    ];
    const prereleaseMinorVersions = [
      [undefined, "2.0.0-alpha.1+build"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2+build"],
      ["2.0.1-alpha.1", "2.1.0-alpha.1+build"],
      ["2.0.0", "2.1.0-alpha.1+build"],
    ];
    const prereleaseMajorVersions = [
      [undefined, "2.0.0-alpha.1+build"],
      ["2.0.0-alpha.1", "2.0.0-alpha.2+build"],
      ["2.0.1-alpha.1", `${new Date().getFullYear() - 2000}.0.0-alpha.1+build`],
      ["2.0.0", `${new Date().getFullYear() - 2000}.0.0-alpha.1+build`],
    ];

    it("should return undefined if no version range on maintenance branch", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            branch: {
              name: "maintenance",
              type: BranchType.maintenance,
              ranges: {},
              tags: {},
            },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBeUndefined();
    });

    it("should return undefined on next branch", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            branch: {
              name: "next",
              type: BranchType.next,
              ranges: {
                "npm/calver": {
                  min: "1.1.0",
                },
              },
              tags: {},
            },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBeUndefined();
    });

    it("should return undefined on next-major branch", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            branch: {
              name: "next-major",
              type: BranchType.nextMajor,
              ranges: {
                "npm/calver": {
                  min: "2.0.0",
                },
              },
              tags: {},
            },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBeUndefined();
    });

    it("should get next patch prerelease version without build metadata for prerelease branch", () => {
      for (const [version, next] of prereleasePatchVersionsWithoutBuild) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              package: {
                ...pkg,
                versioning: {
                  ...versioning,
                  build: undefined,
                },
              },
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.patch,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next patch prerelease version for prerelease branch", () => {
      for (const [version, next] of prereleasePatchVersions) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.patch,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next minor prerelease version for prerelease branch", () => {
      for (const [version, next] of prereleaseMinorVersions) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.minor,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next major prerelease version for prerelease branch", () => {
      for (const [version, next] of prereleaseMajorVersions) {
        expect(
          getNextVersion(
            {
              ...prereleaseBranchCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.major,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next patch prerelease version for release branch", () => {
      for (const [version, next] of prereleasePatchVersions) {
        expect(
          getNextVersion(
            {
              ...releaseBranchPrereleaseCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.patch,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next minor prerelease version for release branch", () => {
      for (const [version, next] of prereleaseMinorVersions) {
        expect(
          getNextVersion(
            {
              ...releaseBranchPrereleaseCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.minor,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next major prerelease version for release branch", () => {
      for (const [version, next] of prereleaseMajorVersions) {
        expect(
          getNextVersion(
            {
              ...releaseBranchPrereleaseCtx,
              lastRelease: version ? { version } : undefined,
            } as unknown as NormalizedStepContext<Step.analyzeCommits>,
            ReleaseType.major,
            hash,
          ),
        ).toBe(next);
      }
    });

    it("should get next patch version for release branch if no last release found", () => {
      expect(
        getNextVersion(
          releaseBranchCtx as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next patch version for release branch if last release found", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBe("2.0.1");
    });

    it("should get next patch version for release branch if last release is prerelease", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0-alpha.1" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.patch,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next minor version for release branch if no last release found", () => {
      expect(
        getNextVersion(
          releaseBranchCtx as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next minor version for release branch if last release found", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toBe("2.1.0");
    });

    it("should get next minor version for release branch if last release is prerelease", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0-alpha.1" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next major version for release branch if no last release found", () => {
      expect(
        getNextVersion(
          releaseBranchCtx as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should get next major version for release branch if last release found", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe(`${new Date().getFullYear() - 2000}.0.0`);
    });

    it("should get next major version for release branch if last release is prerelease", () => {
      expect(
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "2.0.0-alpha.1" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe("2.0.0");
    });

    it("should throw error if version is not in range", () => {
      expect(() =>
        getNextVersion(
          {
            ...releaseBranchCtx,
            lastRelease: { version: "1.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toThrow(InvalidNextVersionError);

      expect(() =>
        getNextVersion(
          {
            ...releaseBranchCtx,
            branch: { ...branches.main, type: BranchType.maintenance },
            lastRelease: { version: "1.0.0" },
          } as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.minor,
          hash,
        ),
      ).toThrow(InvalidNextVersionError);
    });

    it("should generate default version if there is no initial version", () => {
      const year = new Date().getFullYear() - 2000;
      const releaseBranchCtxWithoutPrerelease = {
        ...releaseBranchCtx,
        package: {
          ...pkg,
          versioning: {
            scheme: VersioningScheme.CalVer,
            format,
            prerelease: undefined,
            build: undefined,
          },
        },
        branch: { ...branches.main, ranges: {} },
      };
      expect(
        getNextVersion(
          releaseBranchCtxWithoutPrerelease as unknown as NormalizedStepContext<Step.analyzeCommits>,
          ReleaseType.major,
          hash,
        ),
      ).toBe(`${year}.0.0`);
    });
  });
});
