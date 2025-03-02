import path from "node:path";

import { temporaryDirectory } from "tempy";

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
const root = temporaryDirectory();
const packages: Package[] = [
  {
    path: path.resolve(root, "a"),
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
    path: path.resolve(root, "b"),
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
    path: path.resolve(root, "c"),
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
  repositoryRoot: root,
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
      return ["file", path.join("a", "dir", "file"), path.join("a", "file")];
    }
    case "b": {
      return ["file", path.join("b", "dir", "file"), path.join("b", "file")];
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
