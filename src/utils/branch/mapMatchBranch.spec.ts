import { BaseContext, Package, VersioningScheme } from "@lets-release/config";
import { NormalizedVersioningPrereleaseOptions } from "@lets-release/versioning";

import { MatchBranch } from "src/types/MatchBranch";
import { mapMatchBranch } from "src/utils/branch/mapMatchBranch";
import { getBranchTags } from "src/utils/git/getBranchTags";
import { getNote } from "src/utils/git/getNote";

vi.mock("src/utils/git/getBranchTags");
vi.mock("src/utils/git/getNote");

const tags = [
  "npm/main/v3.0.0",
  "v1.0.0",
  "v2.0.0",
  "npm/pkg/v2022.3.3",
  "npm/pkg/v2022.1.0",
  "npm/pkg/v2022.2.0",
  "unknown/v1.2.3",
  "npm/main/v",
  "npm/main/vTag",
  "npm/pkg/vTag",
];

vi.mocked(getBranchTags).mockResolvedValue(tags);
vi.mocked(getNote).mockResolvedValue({});

const prerelease: NormalizedVersioningPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
};

describe("mapMatchBranch", () => {
  it("should map match branch", async () => {
    await expect(
      mapMatchBranch(
        {
          options: {
            tagFormat: "v${version}",
            refSeparator: "/",
          },
        } as BaseContext,
        [
          {
            main: true,
            name: "main",
            uniqueName: "npm/main",
            versioning: {
              scheme: VersioningScheme.SemVer,
              initialVersion: "1.0.0",
              prerelease,
            },
          },
          {
            name: "pkg",
            uniqueName: "npm/pkg",
            versioning: {
              scheme: VersioningScheme.CalVer,
              format: "YYYY.MINOR.MICRO",
              prerelease,
            },
          },
        ] as Package[],
        { name: "main" } as MatchBranch,
      ),
    ).resolves.toEqual({
      name: "main",
      tags: {
        "npm/main": [
          {
            package: "npm/main",
            tag: "npm/main/v3.0.0",
            version: "3.0.0",
            artifacts: [],
          },
          {
            package: "npm/main",
            tag: "v2.0.0",
            version: "2.0.0",
            artifacts: [],
          },
          {
            package: "npm/main",
            tag: "v1.0.0",
            version: "1.0.0",
            artifacts: [],
          },
        ],
        "npm/pkg": [
          {
            package: "npm/pkg",
            tag: "npm/pkg/v2022.3.3",
            version: "2022.3.3",
            artifacts: [],
          },
          {
            package: "npm/pkg",
            tag: "npm/pkg/v2022.2.0",
            version: "2022.2.0",
            artifacts: [],
          },
          {
            package: "npm/pkg",
            tag: "npm/pkg/v2022.1.0",
            version: "2022.1.0",
            artifacts: [],
          },
        ],
      },
    });
  });
});
