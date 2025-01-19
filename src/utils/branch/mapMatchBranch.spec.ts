import { BaseContext, Package, VersioningScheme } from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranch } from "src/types/MatchBranch";
import { mapMatchBranch } from "src/utils/branch/mapMatchBranch";
import { getBranchTags } from "src/utils/git/getBranchTags";
import { getNote } from "src/utils/git/getNote";

vi.mock("src/utils/git/getBranchTags");
vi.mock("src/utils/git/getNote");

const tags = [
  "main/v3.0.0",
  "v1.0.0",
  "v2.0.0",
  "package/v2022.3.3",
  "package/v2022.1.0",
  "package/v2022.2.0",
  "unknown/v1.2.3",
  "main/v",
  "main/vTag",
  "package/vTag",
];

vi.mocked(getBranchTags).mockResolvedValue(tags);
vi.mocked(getNote).mockResolvedValue({});

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
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
            versioning: {
              scheme: VersioningScheme.SemVer,
              initialVersion: "1.0.0",
              prerelease,
            },
          },
          {
            name: "package",
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
        main: [
          {
            package: "main",
            tag: "main/v3.0.0",
            version: "3.0.0",
            artifacts: [],
          },
          {
            package: "main",
            tag: "v2.0.0",
            version: "2.0.0",
            artifacts: [],
          },
          {
            package: "main",
            tag: "v1.0.0",
            version: "1.0.0",
            artifacts: [],
          },
        ],
        package: [
          {
            package: "package",
            tag: "package/v2022.3.3",
            version: "2022.3.3",
            artifacts: [],
          },
          {
            package: "package",
            tag: "package/v2022.2.0",
            version: "2022.2.0",
            artifacts: [],
          },
          {
            package: "package",
            tag: "package/v2022.1.0",
            version: "2022.1.0",
            artifacts: [],
          },
        ],
      },
    });
  });
});
