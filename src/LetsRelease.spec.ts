/* eslint-disable @typescript-eslint/no-unsafe-call */
import envCi, { JenkinsEnv } from "env-ci";

import {
  Artifact,
  BranchType,
  HistoricalRelease,
  MainBranch,
  MaintenanceBranch,
  NextBranch,
  NormalizedNextRelease,
  NormalizedOptions,
  PrereleaseBranch,
  ReleaseType,
} from "@lets-release/config";

import { DuplicatePackagesError } from "src/errors/DuplicatePackagesError";
import { NoGitRepoError } from "src/errors/NoGitRepoError";
import { NoGitRepoPermissionError } from "src/errors/NoGitRepoPermissionError";
import { WorkflowsError } from "src/errors/WorkflowsError";
import { LetsRelease } from "src/LetsRelease";
import { getBranches } from "src/utils/branch/getBranches";
import { getCommits } from "src/utils/branch/getCommits";
import { getMergingContexts } from "src/utils/branch/getMergingContexts";
import { getNextVersion } from "src/utils/branch/getNextVersion";
import { getReleases } from "src/utils/branch/getReleases";
import { verifyMaintenanceMergeRange } from "src/utils/branch/verifyMaintenanceMergeRange";
import { getMatchFiles } from "src/utils/getMatchFiles";
import { addNote } from "src/utils/git/addNote";
import { addTag } from "src/utils/git/addTag";
import { commit } from "src/utils/git/commit";
import { getAuthUrl } from "src/utils/git/getAuthUrl";
import { getHeadHash } from "src/utils/git/getHeadHash";
import { getHeadName } from "src/utils/git/getHeadName";
import { getModifiedFiles } from "src/utils/git/getModifiedFiles";
import { getRoot } from "src/utils/git/getRoot";
import { isBranchUpToDate } from "src/utils/git/isBranchUpToDate";
import { isGitRepo } from "src/utils/git/isGitRepo";
import { verifyAuth } from "src/utils/git/verifyAuth";
import { loadConfig } from "src/utils/loadConfig";
import { parseMarkdown } from "src/utils/parseMarkdown";
import { getStepPipelinesList } from "src/utils/plugin/getStepPipelinesList";

const Signale = vi.hoisted(() => vi.fn());

vi.mock("signale", () => ({ default: { Signale } }));
vi.mock("env-ci");
vi.mock("src/utils/getMatchFiles");
vi.mock("src/utils/loadConfig");
vi.mock("src/utils/logErrors");
vi.mock("src/utils/parseMarkdown");
vi.mock("src/utils/verifyEngines");
vi.mock("src/utils/verifyGitVersion");
vi.mock("src/utils/branch/getBranches");
vi.mock("src/utils/branch/getCommits");
vi.mock("src/utils/branch/getMergingContexts");
vi.mock("src/utils/branch/getNextVersion");
vi.mock("src/utils/branch/getReleases");
vi.mock("src/utils/branch/verifyMaintenanceMergeRange");
vi.mock("src/utils/git/addFiles");
vi.mock("src/utils/git/addNote");
vi.mock("src/utils/git/addTag");
vi.mock("src/utils/git/commit");
vi.mock("src/utils/git/getAuthUrl");
vi.mock("src/utils/git/getHeadHash");
vi.mock("src/utils/git/getHeadName");
vi.mock("src/utils/git/getModifiedFiles");
vi.mock("src/utils/git/getRoot");
vi.mock("src/utils/git/getTagHash");
vi.mock("src/utils/git/isBranchUpToDate");
vi.mock("src/utils/git/isGitRepo");
vi.mock("src/utils/git/pushBranch");
vi.mock("src/utils/git/pushNote");
vi.mock("src/utils/git/pushTag");
vi.mock("src/utils/git/verifyAuth");
vi.mock("src/utils/plugin/getStepPipelinesList");

const write = vi.spyOn(process.stdout, "write");

const letsRelease = new LetsRelease();
const logger = {
  log: vi.fn(),
  warn: vi.fn(),
  success: vi.fn(),
};

const repositoryRoot = "/path/to/pkg";
const files = ["/path/to/pkg/a", "/path/to/pkg/b"];
const packages = [
  {
    path: repositoryRoot,
    type: "npm",
    name: "pkg",
    uniqueName: "pkg",
  },
];
const notes = "notes";
const releaseType = ReleaseType.patch;
const artifacts: Artifact[] = [
  {
    channels: [null],
    pluginName: "@lets-release/npm",
    name: "npm package",
  },
];

const mainBranch: MainBranch = {
  type: BranchType.main,
  name: "main",
  channels: { default: [null] },
  ranges: {
    pkg: { min: "2.0.0", max: "3.0.0" },
  },
  tags: {
    pkg: [
      {
        package: "pkg",
        tag: "v1.0.0",
        version: "1.0.0",
        artifacts: [
          {
            channels: [null],
            pluginName: "@lets-release/npm",
            name: "npm package",
          },
        ],
      },
    ],
  },
};
const nextBranch: NextBranch = {
  type: BranchType.next,
  name: "next",
  channels: { default: ["next"] },
  ranges: {
    pkg: { min: "3.0.0" },
  },
  tags: {
    pkg: [
      {
        package: "pkg",
        tag: "v2.0.0",
        version: "2.0.0",
        artifacts: [
          {
            channels: ["next"],
            pluginName: "@lets-release/npm",
            name: "npm package",
          },
        ],
      },
    ],
  },
};
const maintenanceBranches: MaintenanceBranch[] = [
  {
    type: BranchType.maintenance,
    name: "1.x",
    channels: { "@lets-release/npm": ["1.x"], default: ["1.x"] },
    ranges: {
      pkg: {
        min: "1.0.1",
        max: "2.0.0",
        mergeMin: "1.0.0",
        mergeMax: "2.0.0",
      },
    },
    tags: {
      pkg: [
        {
          package: "pkg",
          tag: "v1.0.1",
          version: "1.0.1",
          artifacts: [
            {
              channels: ["1.x"],
              pluginName: "@lets-release/npm",
              name: "npm package",
            },
          ],
        },
        {
          package: "pkg",
          tag: "v2.1.0",
          version: "2.1.0",
          artifacts: [
            {
              channels: ["1.x"],
              pluginName: "@lets-release/npm",
              name: "npm package",
            },
          ],
        },
      ],
    },
  },
];
const prereleaseBranches: PrereleaseBranch[] = [
  {
    type: BranchType.prerelease,
    name: "alpha",
    prerelease: {
      name: { default: "alpha" },
      channels: { "@lets-release/npm": ["alpha"], default: ["alpha"] },
    },
    tags: {},
  },
];

const findPackages = vi.fn();
const verifyConditions = vi.fn();
const analyzeCommits = vi.fn();
const verifyRelease = vi.fn();
const generateNotes = vi.fn();
const addChannels = vi.fn();
const prepare = vi.fn();
const publish = vi.fn();
const success = vi.fn();

describe("LetsRelease", () => {
  beforeEach(() => {
    findPackages
      .mockReset()
      .mockImplementation((_, { getPluginContext, setPluginContext }) => {
        setPluginContext(0, "@lets-release/npm", "test");
        getPluginContext(0, "@lets-release/npm");
        return packages;
      });
    verifyConditions.mockReset();
    analyzeCommits
      .mockReset()
      .mockImplementation(
        (_, { getPluginPackageContext, setPluginPackageContext }) => {
          setPluginPackageContext(0, "@lets-release/npm", "pkg", "test");
          getPluginPackageContext(0, "@lets-release/npm", "pkg");
          return releaseType;
        },
      );
    verifyRelease.mockReset();
    generateNotes.mockReset().mockResolvedValue(notes);
    addChannels.mockReset().mockResolvedValue(undefined);
    prepare.mockReset();
    publish.mockReset().mockResolvedValue(artifacts);
    success.mockReset();
    write.mockReset().mockImplementation(() => true);
    Signale.mockReset().mockReturnValue(logger);
    vi.mocked(getMatchFiles).mockReset().mockReturnValue(files);
    vi.mocked(envCi)
      .mockReset()
      .mockReturnValue({
        isCi: true,
        isPr: false,
        branch: "main",
      } as JenkinsEnv);
    vi.mocked(isGitRepo).mockReset().mockResolvedValue(true);
    vi.mocked(loadConfig)
      .mockReset()
      .mockResolvedValue({
        tagFormat: "v${version}",
        refSeparator: "/",
        packages: [
          {
            paths: ["/path/to"],
          },
        ],
      } as NormalizedOptions);
    vi.mocked(getStepPipelinesList).mockReset().mockResolvedValue([
      {
        findPackages,
        verifyConditions,
        analyzeCommits,
        verifyRelease,
        generateNotes,
        addChannels,
        prepare,
        publish,
        success,
      },
    ]);
    vi.mocked(getRoot).mockReset().mockResolvedValue(repositoryRoot);
    vi.mocked(getAuthUrl).mockReset().mockResolvedValue("https://repo.url");
    vi.mocked(getBranches).mockReset().mockResolvedValue({
      main: mainBranch,
      next: nextBranch,
      maintenance: maintenanceBranches,
      prerelease: prereleaseBranches,
    });
    vi.mocked(isBranchUpToDate).mockReset().mockResolvedValue(true);
    vi.mocked(getMergingContexts).mockReset().mockResolvedValue({});
    vi.mocked(verifyMaintenanceMergeRange).mockReset().mockReturnValue(true);
    vi.mocked(getCommits).mockReset().mockResolvedValue({});
    vi.mocked(addNote).mockClear();
    vi.mocked(getHeadHash).mockReset().mockResolvedValue("headhash");
    vi.mocked(getReleases).mockReset().mockReturnValue({});
    vi.mocked(getNextVersion).mockReset().mockReturnValue("2.0.1");
    vi.mocked(addTag).mockClear();
    vi.mocked(parseMarkdown).mockClear();
    vi.mocked(getModifiedFiles).mockReset().mockResolvedValue(files);
    vi.mocked(commit).mockClear();
    vi.mocked(verifyAuth).mockReset();
  });

  it("should throw NoGitRepoError if not a git repository", async () => {
    vi.mocked(isGitRepo).mockResolvedValue(false);

    await expect(letsRelease.run()).rejects.toThrow(NoGitRepoError);
  });

  it("should return undefined if it was triggered by a pull request and should not skip CI verification", async () => {
    vi.mocked(envCi).mockReturnValue({ isCi: true, isPr: true } as JenkinsEnv);

    await expect(letsRelease.run()).resolves.toBeUndefined();
  });

  it("should throw NoGitRepoPermissionError if no permission to access git repository", async () => {
    vi.mocked(envCi).mockReturnValue({
      isCi: false,
      isPr: true,
    } as unknown as JenkinsEnv);
    vi.mocked(getHeadName).mockResolvedValue("main");
    vi.mocked(verifyAuth).mockRejectedValue(new Error("No permission"));

    await expect(letsRelease.run()).rejects.toThrow(NoGitRepoPermissionError);
  });

  it("should return undefined if branch is not update to date", async () => {
    vi.mocked(envCi).mockReturnValue({
      isCi: false,
      isPr: true,
    } as unknown as JenkinsEnv);
    vi.mocked(getHeadName).mockResolvedValue("main");
    vi.mocked(verifyAuth).mockRejectedValue(new Error("No permission"));
    vi.mocked(isBranchUpToDate).mockResolvedValue(false);

    await expect(letsRelease.run()).resolves.toBeUndefined();
  });

  it("should throw WorkflowsError if failed to run group workflows", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
      },
      {
        path: "/path/to/pkg2",
        type: "npm",
        name: "pkg2",
        uniqueName: "pkg2",
      },
    ]);

    vi.mocked(getStepPipelinesList).mockResolvedValue([
      { findPackages },
      { findPackages: vi.fn().mockRejectedValue(new Error("unknown")) },
      {},
    ]);

    await expect(letsRelease.run()).rejects.toThrow(WorkflowsError);
  });

  it("should throw DuplicatePackagesError if duplicate packages are found", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
      },
      {
        path: "/path/to/pkg2",
        type: "npm",
        name: "pkg2",
        uniqueName: "pkg2",
      },
    ]);

    vi.mocked(getStepPipelinesList).mockResolvedValue([
      { findPackages },
      { findPackages },
      {},
    ]);

    await expect(letsRelease.run()).rejects.toThrow(DuplicatePackagesError);
  });

  it("should return undefined if current branch is not configured", async () => {
    vi.mocked(envCi).mockReturnValue({
      isCi: true,
      isPr: false,
      branch: "test",
    } as JenkinsEnv);

    await expect(letsRelease.run()).resolves.toBeUndefined();
  });

  it("should throw AggregateError if maintenance merge range is not satisfied", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
        dependencies: [
          {
            type: "npm",
            name: "pkg",
          },
        ],
      },
      ...packages,
    ]);
    const lastRelease: HistoricalRelease = {
      tag: "v2.0.0",
      version: "2.0.0",
      hash: "abc123",
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const currentRelease: HistoricalRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      artifacts: [
        {
          channels: ["next"],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const nextRelease: NormalizedNextRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      channels: { default: [null] },
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };

    vi.mocked(envCi)
      .mockReset()
      .mockReturnValue({
        isCi: true,
        isPr: false,
        branch: "1.x",
      } as JenkinsEnv);
    vi.mocked(getStepPipelinesList).mockResolvedValue([{ findPackages }]);
    vi.mocked(getMergingContexts).mockResolvedValue({
      pkg: { lastRelease, currentRelease, nextRelease },
    });
    vi.mocked(verifyMaintenanceMergeRange).mockReturnValue(false);

    await expect(letsRelease.run()).rejects.toThrow(WorkflowsError);
    expect(getMergingContexts).toHaveBeenCalledTimes(2);
    expect(getMergingContexts).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({}),
      expect.arrayContaining([expect.objectContaining({ name: "pkg" })]),
      expect.objectContaining({}),
      expect.objectContaining({}),
    );
    expect(getMergingContexts).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({}),
      expect.arrayContaining([expect.objectContaining({ name: "pkg1" })]),
      expect.objectContaining({}),
      expect.objectContaining({}),
    );
  });

  it("should throw error if failed to run addChannels step", async () => {
    const addChannels = vi
      .fn()
      .mockRejectedValue(new Error("Failed to add channels"));
    const fail = vi.fn();
    vi.mocked(getStepPipelinesList).mockReset().mockResolvedValue([
      {
        findPackages,
        verifyConditions,
        analyzeCommits,
        verifyRelease,
        generateNotes,
        addChannels,
        prepare,
        publish,
        success,
        fail,
      },
    ]);
    const lastRelease: HistoricalRelease = {
      tag: "v2.0.0",
      version: "2.0.0",
      hash: "abc123",
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const currentRelease: HistoricalRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      artifacts: [
        {
          channels: ["next"],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const nextRelease: NormalizedNextRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      channels: { default: [null] },
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };

    vi.mocked(envCi)
      .mockReset()
      .mockReturnValue({
        isCi: true,
        isPr: false,
        branch: "1.x",
      } as JenkinsEnv);
    vi.mocked(getMergingContexts).mockResolvedValue({
      pkg: { lastRelease, currentRelease, nextRelease },
    });

    await expect(letsRelease.run()).rejects.toThrow();
    expect(fail).toHaveBeenCalledOnce();
  });

  it("should throw error if failed to run addChannels and fail steps", async () => {
    const addChannels = vi
      .fn()
      .mockRejectedValue(new Error("Failed to add channels"));
    const fail = vi.fn().mockRejectedValue(new Error("Failed"));
    vi.mocked(getStepPipelinesList).mockReset().mockResolvedValue([
      {
        findPackages,
        verifyConditions,
        analyzeCommits,
        verifyRelease,
        generateNotes,
        addChannels,
        prepare,
        publish,
        success,
        fail,
      },
    ]);
    const lastRelease: HistoricalRelease = {
      tag: "v2.0.0",
      version: "2.0.0",
      hash: "abc123",
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const currentRelease: HistoricalRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      artifacts: [
        {
          channels: ["next"],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const nextRelease: NormalizedNextRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      channels: { default: [null] },
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };

    vi.mocked(envCi)
      .mockReset()
      .mockReturnValue({
        isCi: true,
        isPr: false,
        branch: "1.x",
      } as JenkinsEnv);
    vi.mocked(getMergingContexts).mockResolvedValue({
      pkg: { lastRelease, currentRelease, nextRelease },
    });

    await expect(letsRelease.run()).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(Error), expect.any(Error)],
          }),
        ],
      }),
    );
    expect(fail).toHaveBeenCalledOnce();
  });

  it("should handle merged releases", async () => {
    const lastRelease: HistoricalRelease = {
      tag: "v2.0.0",
      version: "2.0.0",
      hash: "abc123",
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const currentRelease: HistoricalRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      artifacts: [
        {
          channels: ["next"],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };
    const nextRelease: NormalizedNextRelease = {
      tag: "v2.1.0",
      version: "2.1.0",
      hash: "def123",
      channels: { default: [null] },
      artifacts: [
        {
          channels: [null],
          pluginName: "@lets-release/npm",
          name: "npm package",
        },
      ],
    };

    vi.mocked(envCi)
      .mockReset()
      .mockReturnValue({
        isCi: true,
        isPr: false,
        branch: "1.x",
      } as JenkinsEnv);
    vi.mocked(getMergingContexts).mockResolvedValue({
      pkg: { lastRelease, currentRelease, nextRelease },
    });

    await expect(letsRelease.run()).resolves.toEqual([
      { ...nextRelease, artifacts: [] },
      {
        hash: "headhash",
        notes,
        artifacts,
        channels: { "@lets-release/npm": ["1.x"], default: ["1.x"] },
        tag: "v2.0.1",
        version: "2.0.1",
      },
    ]);
  });

  it("should throw error if failed to run publish step", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
      },
      {
        path: "/path/to/pkg2",
        type: "npm",
        name: "pkg2",
        uniqueName: "pkg2",
      },
      {
        path: "/path/to/pkg3",
        type: "npm",
        name: "pkg3",
        uniqueName: "pkg3",
      },
    ]);
    const publish = vi.fn().mockRejectedValue(new Error("Failed to publish"));
    const fail = vi.fn();

    vi.mocked(getBranches).mockResolvedValue({
      main: mainBranch,
      next: nextBranch,
      maintenance: undefined,
      prerelease: undefined,
    });
    analyzeCommits
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(releaseType);
    vi.mocked(getStepPipelinesList).mockResolvedValue([
      { findPackages, analyzeCommits, generateNotes, publish, fail },
    ]);
    vi.mocked(getReleases).mockReturnValue({
      pkg3: [
        {
          package: "pkg3",
          tag: "v2.0.0",
          version: "2.0.0",
          artifacts: [
            {
              pluginName: "@lets-release/npm",
              channels: [null],
              name: "npm package",
            },
          ],
        },
      ],
    });
    vi.mocked(getNextVersion)
      .mockReturnValueOnce(undefined)
      .mockReturnValue("2.1.0");

    await expect(letsRelease.run()).rejects.toThrow();
    expect(fail).toHaveBeenCalledOnce();
  });

  it("should throw error if failed to run publish and fail steps", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
      },
      {
        path: "/path/to/pkg2",
        type: "npm",
        name: "pkg2",
        uniqueName: "pkg2",
      },
      {
        path: "/path/to/pkg3",
        type: "npm",
        name: "pkg3",
        uniqueName: "pkg3",
      },
    ]);
    const publish = vi.fn().mockRejectedValue(new Error("Failed to publish"));
    const fail = vi.fn().mockRejectedValue(new Error("Failed"));

    vi.mocked(getBranches).mockResolvedValue({
      main: mainBranch,
      next: nextBranch,
      maintenance: undefined,
      prerelease: undefined,
    });
    analyzeCommits
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(releaseType);
    vi.mocked(getStepPipelinesList).mockResolvedValue([
      { findPackages, analyzeCommits, generateNotes, publish, fail },
    ]);
    vi.mocked(getReleases).mockReturnValue({
      pkg3: [
        {
          package: "pkg3",
          tag: "v2.0.0",
          version: "2.0.0",
          artifacts: [
            {
              pluginName: "@lets-release/npm",
              channels: [null],
              name: "npm package",
            },
          ],
        },
      ],
    });
    vi.mocked(getNextVersion)
      .mockReturnValueOnce(undefined)
      .mockReturnValue("2.1.0");

    await expect(letsRelease.run()).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(Error), expect.any(Error)],
          }),
        ],
      }),
    );
    expect(fail).toHaveBeenCalledOnce();
  });

  it("should make and publish new releases on release branch", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
      },
      {
        path: "/path/to/pkg2",
        type: "npm",
        name: "pkg2",
        uniqueName: "pkg2",
      },
      {
        path: "/path/to/pkg3",
        type: "npm",
        name: "pkg3",
        uniqueName: "pkg3",
      },
    ]);

    vi.mocked(loadConfig)
      .mockReset()
      .mockResolvedValue({
        tagFormat: "v${version}",
        refSeparator: "/",
        mainPackage: "pkg3",
        packages: [
          {
            paths: ["/path/to"],
          },
        ],
      } as NormalizedOptions);
    vi.mocked(getBranches).mockResolvedValue({
      main: mainBranch,
      next: nextBranch,
      maintenance: undefined,
      prerelease: undefined,
    });
    analyzeCommits
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(releaseType);
    vi.mocked(getStepPipelinesList).mockResolvedValue([
      { findPackages, analyzeCommits, generateNotes, publish },
    ]);
    vi.mocked(getReleases).mockReturnValue({
      pkg3: [
        {
          package: "pkg3",
          tag: "v2.0.0",
          version: "2.0.0",
          artifacts: [
            {
              pluginName: "@lets-release/npm",
              channels: [null],
              name: "npm package",
            },
          ],
        },
      ],
    });
    vi.mocked(getNextVersion)
      .mockReturnValueOnce(undefined)
      .mockReturnValue("2.1.0");

    await expect(letsRelease.run()).resolves.toEqual([
      {
        hash: "headhash",
        notes,
        artifacts,
        channels: { default: [null] },
        tag: "v2.1.0",
        version: "2.1.0",
      },
    ]);
  });

  it("should make and publish new releases on prerelease branch", async () => {
    const findPackages = vi.fn().mockResolvedValue([
      {
        path: "/path/to/pkg1",
        type: "npm",
        name: "pkg1",
        uniqueName: "pkg1",
      },
      {
        path: "/path/to/pkg2",
        type: "npm",
        name: "pkg2",
        uniqueName: "pkg2",
      },
      {
        path: "/path/to/pkg3",
        type: "npm",
        name: "pkg3",
        uniqueName: "pkg3",
      },
    ]);

    vi.mocked(envCi)
      .mockReset()
      .mockReturnValue({
        isCi: true,
        isPr: false,
        branch: "alpha",
      } as JenkinsEnv);
    vi.mocked(loadConfig)
      .mockReset()
      .mockResolvedValue({
        dryRun: true,
        tagFormat: "v${version}",
        refSeparator: "/",
        releaseCommit: {
          assets: false,
          message:
            "chore(release): [skip ci]\n\n${releases.map(x => x.tag).join('\\n')}",
        },
        packages: [
          {
            paths: ["/path/to"],
          },
        ],
      } as NormalizedOptions);
    analyzeCommits
      .mockResolvedValueOnce(undefined)
      .mockResolvedValue(releaseType);
    vi.mocked(getStepPipelinesList).mockResolvedValue([
      { findPackages, analyzeCommits, generateNotes, publish },
    ]);
    vi.mocked(getReleases).mockReturnValue({
      pkg3: [
        {
          package: "pkg3",
          tag: "v2.0.0",
          version: "2.0.0",
          artifacts: [
            {
              pluginName: "@lets-release/npm",
              channels: [null],
              name: "npm package",
            },
          ],
        },
      ],
    });
    vi.mocked(getNextVersion)
      .mockReturnValueOnce(undefined)
      .mockReturnValue("2.1.0");

    await expect(letsRelease.run()).resolves.toEqual([
      {
        hash: "headhash",
        notes,
        artifacts,
        channels: { "@lets-release/npm": ["alpha"], default: ["alpha"] },
        tag: "pkg3/v2.1.0",
        version: "2.1.0",
      },
    ]);
  });

  it("should commit without assets", async () => {
    vi.mocked(loadConfig)
      .mockReset()
      .mockResolvedValue({
        tagFormat: "v${version}",
        refSeparator: "/",
        releaseCommit: {
          assets: false,
          message:
            "chore(release): [skip ci]\n\n${releases.map(x => x.tag).join('\\n')}",
        },
        packages: [
          {
            paths: ["/path/to"],
          },
        ],
      } as NormalizedOptions);

    await expect(letsRelease.run()).resolves.toEqual([
      {
        hash: "headhash",
        notes,
        artifacts,
        channels: { default: [null] },
        tag: "v2.0.1",
        version: "2.0.1",
      },
    ]);
  });

  it("should commit with assets", async () => {
    publish.mockResolvedValue(undefined);
    vi.mocked(loadConfig)
      .mockReset()
      .mockResolvedValue({
        tagFormat: "v${version}",
        refSeparator: "/",
        releaseCommit: {
          assets: ["!CHANGELOG.md", ["!CHANGELOG.md"]],
          message:
            "chore(release): [skip ci]\n\n${releases.map(x => x.tag).join('\\n')}",
        },
        packages: [
          {
            paths: ["/path/to"],
          },
        ],
      } as NormalizedOptions);

    await expect(letsRelease.run()).resolves.toEqual([
      {
        hash: "headhash",
        notes,
        artifacts: [],
        channels: { default: [null] },
        tag: "v2.0.1",
        version: "2.0.1",
      },
    ]);
  });
});
