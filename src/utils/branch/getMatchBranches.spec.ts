import { NormalizedBranchesOptions, Package } from "@lets-release/config";

import { filterParsedBranch } from "src/utils/branch/filterParsedBranch";
import { flatMapParsedBranch } from "src/utils/branch/flatMapParsedBranch";
import { getMatchBranches } from "src/utils/branch/getMatchBranches";

vi.mock("src/utils/branch/filterParsedBranch");
vi.mock("src/utils/branch/flatMapParsedBranch");

vi.mocked(filterParsedBranch).mockImplementation(
  (type, name, branch) => name === branch.name,
);
vi.mocked(flatMapParsedBranch).mockImplementation(((
  packages,
  type,
  obj,
  branch,
) => [branch]) as typeof flatMapParsedBranch);

const packages: Package[] = [];

describe("getMatchBranches", () => {
  it("should get match branches", () => {
    expect(
      getMatchBranches(
        packages,
        {
          main: "main",
          next: { name: "next" },
          prerelease: ["alpha"],
        } as NormalizedBranchesOptions,
        [
          {
            name: "main",
          },
          {
            name: "next",
          },
          {
            name: "alpha",
          },
        ],
      ),
    ).toEqual({
      main: [{ name: "main" }],
      next: [{ name: "next" }],
      prerelease: [{ name: "alpha" }],
    });
  });
});
