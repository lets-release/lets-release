import {
  Commit,
  Package,
  VerifyConditionsContext,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { getCommits } from "src/utils/branch/getCommits";
import { getCommittedFiles } from "src/utils/git/getCommittedFiles";
import { getLogs } from "src/utils/git/getLogs";

vi.mock("src/utils/git/getCommittedFiles");
vi.mock("src/utils/git/getLogs");

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const packages: Package[] = [
  {
    path: "/path/to/repo/a",
    type: "npm",
    name: "a",
    uniqueName: "a",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    path: "/path/to/repo/b",
    type: "npm",
    name: "b",
    uniqueName: "b",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
];
const allPackages: Package[] = [
  ...packages,
  {
    path: "/path/to/repo/c",
    type: "npm",
    name: "c",
    uniqueName: "c",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
];
const context = {
  env: process.env,
  repositoryRoot: "/path/to/repo",
  options: {},
  packages,
} as VerifyConditionsContext;

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
    await expect(getCommits(context, allPackages)).resolves.toEqual({
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
    await expect(getCommits(context, allPackages, "from")).resolves.toEqual({
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

  it("should filter out shared workspace files", async () => {
    await expect(
      getCommits(
        {
          ...context,
          options: {
            sharedWorkspaceFiles: ["file"],
          },
        } as unknown as VerifyConditionsContext,
        allPackages,
        "from",
      ),
    ).resolves.toEqual({
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
