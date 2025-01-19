import { Package } from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getFirstVersion } from "src/utils/branch/getFirstVersion";

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const pkgA = {
  name: "a",
  versioning: {
    scheme: "SemVer",
    prerelease,
  },
} as Package;
const pkgB = {
  name: "b",
  versioning: {
    scheme: "CalVer",
    format: "YYYY.MICRO",
    prerelease,
  },
} as Package;

describe("getFirstVersion", () => {
  it("should return first semver version", () => {
    expect(
      getFirstVersion(
        pkgA,
        {
          tags: {
            a: [
              {
                version: "1.0.0-alpha",
              },
              {
                version: "1.10.9",
              },
              {
                version: "2.6.8",
              },
              {
                version: "3.4.5",
              },
            ],
          },
        } as unknown as MatchBranchWithTags,
        {
          lowerBranches: [
            {
              tags: {
                a: [
                  {
                    version: "1.3.0",
                  },
                  {
                    version: "2.3.0",
                  },
                ],
              },
            } as unknown as MatchBranchWithTags,
          ],
        },
      ),
    ).toBe("2.6.8");
  });

  it("should return first calver version", () => {
    expect(
      getFirstVersion(
        pkgB,
        {
          tags: {
            b: [
              {
                version: "2024.1-alpha",
              },
              {
                version: "2021.10",
              },
              {
                version: "2022.8",
              },
              {
                version: "2023.5",
              },
            ],
          },
        } as unknown as MatchBranchWithTags,
        {
          lowerBranches: [
            {
              tags: {
                b: [
                  {
                    version: "2021.90",
                  },
                  {
                    version: "2022.10",
                  },
                ],
              },
            } as unknown as MatchBranchWithTags,
          ],
        },
      ),
    ).toBe("2023.5");
  });

  it("should return earliest version if there are no lower branches", () => {
    expect(
      getFirstVersion(pkgA, {
        tags: {
          a: [
            {
              version: "1.0.0-alpha",
            },
            {
              version: "1.10.9",
            },
            {
              version: "2.6.8",
            },
            {
              version: "3.4.5",
            },
          ],
        },
      } as unknown as MatchBranchWithTags),
    ).toBe("1.10.9");
  });
});
