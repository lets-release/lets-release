import { Package } from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getAscendingVersions } from "src/utils/branch/getAscendingVersions";

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const pkgA = {
  name: "a",
  uniqueName: "npm/a",
  versioning: {
    scheme: "SemVer",
    prerelease,
  },
} as Package;
const pkgB = {
  name: "b",
  uniqueName: "npm/b",
  versioning: {
    scheme: "CalVer",
    format: "YYYY.MICRO",
    prerelease,
  },
} as Package;

describe("getAscendingVersions", () => {
  it("should return empty array if no tags found", () => {
    expect(
      getAscendingVersions(pkgA, {
        tags: {},
      } as MatchBranchWithTags),
    ).toHaveLength(0);
  });

  it("should get asc semantic versions", () => {
    const v0 = {
      version: "1.10.9",
    };
    const v1 = {
      version: "2.6.8",
    };
    const v2 = {
      version: "3.4.5",
    };

    const versions = getAscendingVersions(pkgA, {
      tags: {
        "npm/a": [
          {
            version: "1.0.0-alpha",
          },
          v2,
          v1,
          v0,
        ],
      },
    } as unknown as MatchBranchWithTags);

    expect(versions[0]).toBe(v0.version);
    expect(versions[1]).toBe(v1.version);
    expect(versions[2]).toBe(v2.version);
  });

  it("should get asc calendar versions", () => {
    const v0 = {
      version: "2021.10",
    };
    const v1 = {
      version: "2022.8",
    };
    const v2 = {
      version: "2023.5",
    };

    const versions = getAscendingVersions(pkgB, {
      tags: {
        "npm/b": [
          {
            version: "2024.1-alpha",
          },
          v2,
          v1,
          v0,
        ],
      },
    } as unknown as MatchBranchWithTags);

    expect(versions[0]).toBe(v0.version);
    expect(versions[1]).toBe(v1.version);
    expect(versions[2]).toBe(v2.version);
  });

  it("should get asc versions with prerelease", () => {
    const v0 = {
      version: "2021.10",
    };
    const v1 = {
      version: "2022.8",
    };
    const v2 = {
      version: "2023.5",
    };
    const v3 = {
      version: "2024.1-alpha",
    };

    const versions = getAscendingVersions(
      pkgB,
      {
        tags: {
          "npm/b": [v3, v2, v1, v0],
        },
      } as unknown as MatchBranchWithTags,
      { withPrerelease: true },
    );

    expect(versions[0]).toBe(v0.version);
    expect(versions[1]).toBe(v1.version);
    expect(versions[2]).toBe(v2.version);
    expect(versions[3]).toBe(v3.version);
  });
});
