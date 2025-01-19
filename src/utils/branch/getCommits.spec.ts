import {
  BaseContext,
  Commit,
  Package,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { getCommits } from "src/utils/branch/getCommits";
import { getCommittedFiles } from "src/utils/git/getCommittedFiles";
import { getLogs } from "src/utils/git/getLogs";

vi.mock("src/utils/git/getCommittedFiles");
vi.mock("src/utils/git/getLogs");

const context = {
  env: process.env,
  repositoryRoot: "/path/to/repo",
} as BaseContext;
const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const packages: Package[] = [
  {
    name: "a",
    path: "/path/to/repo/a",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    name: "b",
    path: "/path/to/repo/b",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
];

vi.mocked(getLogs).mockResolvedValue([
  { hash: "a" },
  { hash: "b" },
  { hash: "c" },
] as Commit[]);
vi.mocked(getCommittedFiles).mockImplementation(async (hash) => {
  switch (hash) {
    case "a": {
      return ["file", "a/dir/file", "a/file"];
    }
    case "b": {
      return ["file", "b/dir/file", "b/file"];
    }
    default: {
      return [];
    }
  }
});

describe("getCommits", () => {
  it("should retrieve all commits if no `from` is provided", async () => {
    await expect(getCommits(context, packages)).resolves.toEqual({
      a: [
        {
          hash: "a",
        },
      ],
      b: [
        {
          hash: "b",
        },
      ],
    });
  });

  it("should retrieve commits from the provided `from` commit", async () => {
    await expect(getCommits(context, packages, "from")).resolves.toEqual({
      a: [
        {
          hash: "a",
        },
      ],
      b: [
        {
          hash: "b",
        },
      ],
    });
  });
});
