import { Package } from "@lets-release/config";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { getEarliestVersion } from "src/utils/branch/getEarliestVersion";

describe("getEarliestVersion", () => {
  it("should return the earliest version", () => {
    expect(
      getEarliestVersion(
        {
          name: "a",
          uniqueName: "npm/a",
          versioning: {
            scheme: "SemVer",
            prerelease: {
              initialNumber: 1,
              ignoreZeroNumber: true,
              prefix: "-",
              suffix: ".",
            },
          },
        } as Package,
        {
          tags: {
            "npm/a": [
              {
                version: "2.6.8",
              },
              {
                version: "3.4.5",
              },
              {
                version: "1.10.9",
              },
            ],
          },
        } as unknown as MatchBranchWithTags,
      ),
    ).toBe("1.10.9");
  });
});
