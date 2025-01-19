import {
  BranchType,
  MainBranch,
  MaintenanceBranch,
  NextBranch,
  NextMajorBranch,
  PrereleaseBranch,
} from "@lets-release/config";

import { NoMainBranchError } from "src/errors/NoMainBranchError";
import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeBranches } from "src/utils/branch/normalizeBranches";
import { normalizeMainBranch } from "src/utils/branch/normalizeMainBranch";
import { normalizeMaintenanceBranches } from "src/utils/branch/normalizeMaintenanceBranches";
import { normalizeNextBranch } from "src/utils/branch/normalizeNextBranch";
import { normalizeNextMajorBranch } from "src/utils/branch/normalizeNextMajorBranch";
import { normalizePrereleaseBranches } from "src/utils/branch/normalizePrereleaseBranches";

vi.mock("src/utils/branch/normalizeMainBranch");
vi.mock("src/utils/branch/normalizeMaintenanceBranches");
vi.mock("src/utils/branch/normalizeNextBranch");
vi.mock("src/utils/branch/normalizeNextMajorBranch");
vi.mock("src/utils/branch/normalizePrereleaseBranches");

const main = {
  name: "main",
} as MainBranch;
const next = {
  name: "next",
} as NextBranch;
const nextMajor = {
  name: "next-major",
} as NextMajorBranch;
const maintenance = [
  {
    name: "maintenance",
  },
] as MaintenanceBranch[];
const prerelease = [
  {
    name: "prerelease",
  },
] as PrereleaseBranch[];

vi.mocked(normalizeMainBranch).mockReturnValue({
  branch: main,
  latestSemVers: {},
});
vi.mocked(normalizeNextBranch).mockReturnValue({
  branch: next,
  latestSemVers: {},
});
vi.mocked(normalizeNextMajorBranch).mockReturnValue({
  branch: nextMajor,
  latestSemVers: {},
});
vi.mocked(normalizeMaintenanceBranches).mockReturnValue(maintenance);
vi.mocked(normalizePrereleaseBranches).mockReturnValue(prerelease);

describe("normalizeBranches", () => {
  it("should throw error if no main branch", () => {
    expect(() => normalizeBranches([], {})).toThrow(NoMainBranchError);
  });

  it("should normalize branches", () => {
    expect(
      normalizeBranches([], {
        main: [
          main,
          {
            name: "master",
          },
        ],
        next: [next, { name: "another-next" }],
        nextMajor: [nextMajor, { name: "another-next-major" }],
        maintenance,
        prerelease,
      } as {
        [K in BranchType]?: MatchBranchWithTags<K>[];
      }),
    ).toEqual({
      [BranchType.main]: main,
      [BranchType.next]: next,
      [BranchType.nextMajor]: nextMajor,
      [BranchType.maintenance]: maintenance,
      [BranchType.prerelease]: prerelease,
    });
  });
});
