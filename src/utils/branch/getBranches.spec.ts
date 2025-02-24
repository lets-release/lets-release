import { BaseContext, Package, VersioningScheme } from "@lets-release/config";

import { getBranches } from "src/utils/branch/getBranches";
import { mapMatchBranch } from "src/utils/branch/mapMatchBranch";
import { getRemoteBranches } from "src/utils/git/getRemoteBranches";

vi.mock("src/utils/branch/mapMatchBranch");
vi.mock("src/utils/git/fetchBranchTags");
vi.mock("src/utils/git/fetchNotes");
vi.mock("src/utils/git/getRemoteBranches");

const context = {
  env: process.env,
  repositoryRoot: "/path/to/repo",
  options: {
    tagFormat: "v${version}",
    refSeparator: "/",
    branches: {
      main: "(main|master)",
      next: "next",
      nextMajor: "next-major",
      maintenance: [
        "+([0-9])?(.{+([0-9]),x}).x", // semver: N.x, N.x.x, N.N.x
        "+(+([0-9])[._-])?(x[._-])x", // calver
      ],
      prerelease: ["alpha", "beta", "rc"],
    },
  },
} as BaseContext;
const repositoryUrl = "https://github.com/lets-release/lets-release.git";
const ciBranch = "main";
const packages: Package[] = [
  {
    path: "/path/to/repo",
    type: "npm",
    name: "package",
    uniqueName: "package",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease: {
        initialNumber: 1,
        ignoreZeroNumber: true,
        prefix: "-",
        suffix: ".",
      },
    },
  },
];

vi.mocked(mapMatchBranch).mockImplementation(
  async (context, packages, branch) => {
    return {
      ...branch,
      tags: {},
    };
  },
);
vi.mocked(getRemoteBranches).mockResolvedValue(["main", "next"]);

describe("getBranches", () => {
  it("should get branches", async () => {
    await expect(
      getBranches(context, repositoryUrl, ciBranch, packages),
    ).resolves.toEqual({
      main: {
        type: "main",
        name: "main",
        channels: { default: [null] },
        prereleases: undefined,
        tags: {},
        ranges: {
          package: {
            min: "1.0.0",
            max: "2.0.0",
          },
        },
      },
      next: {
        type: "next",
        name: "next",
        channels: { default: ["next"] },
        prereleases: undefined,
        tags: {},
        ranges: {
          package: {
            min: "2.0.0",
            max: undefined,
          },
        },
      },
      nextMajor: undefined,
      maintenance: [],
      prerelease: [],
    });
  });
});
