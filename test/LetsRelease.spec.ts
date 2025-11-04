/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import envCi, { CiEnv } from "env-ci";
import { omit } from "lodash-es";
import { WritableStreamBuffer } from "stream-buffers";
import { ZodError } from "zod";

import {
  BranchType,
  Context,
  Options,
  Package,
  ReleaseType,
  Step,
  StepFunction,
  VerifyConditionsContext,
} from "@lets-release/config";

import { SECRET_REPLACEMENT } from "src/constants/SECRET_REPLACEMENT";
import { InvalidMaintenanceMergeError } from "src/errors/InvalidMaintenanceMergeError";
import { InvalidNextVersionError } from "src/errors/InvalidNextVersionError";
import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { LetsRelease } from "src/LetsRelease";
import { defaultGitUserEmail, defaultGitUserName, name } from "src/program";
import { getCommits } from "src/utils/branch/getCommits";
import { getNote } from "src/utils/git/getNote";
import { getTagHash } from "src/utils/git/getTagHash";
import { addFiles } from "test/__helpers__/git/addFiles";
import { addNote } from "test/__helpers__/git/addNote";
import { addTag } from "test/__helpers__/git/addTag";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { getRemoteTagHash } from "test/__helpers__/git/getRemoteTagHash";
import { initRepo } from "test/__helpers__/git/initRepo";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { mergeBranch } from "test/__helpers__/git/mergeBranch.js";
import { pushBranch } from "test/__helpers__/git/pushBranch";
import { rebaseBranch } from "test/__helpers__/git/rebaseBranch";
import { writeFile } from "test/__helpers__/writeFile";

const Signale = vi.hoisted(() => {
  class Signale {
    log() {
      //
    }
    warn() {
      //
    }
    success() {
      //
    }
    error() {
      //
    }
    scope() {
      //
    }
  }

  return Signale;
});

vi.mock("env-ci");
vi.mock("signale", () => ({ default: { Signale } }));

const logger = {
  log: vi.fn(),
  error: vi.fn(),
  success: vi.fn(),
  warn: vi.fn(),
  scope: vi.fn(() => logger),
};

Signale.prototype.log = logger.log;
Signale.prototype.warn = logger.warn;
Signale.prototype.success = logger.success;
Signale.prototype.error = logger.error;
Signale.prototype.scope = logger.scope;

async function testAddChannels(
  fn: (cwd: string, ref: string) => Promise<void>,
) {
  const url = await initRepoAsRemote();
  const cwd = await cloneRepo(url);

  await checkoutBranch(cwd, "main");
  await writeFile(cwd, ["file1.js"]);
  await addFiles(cwd);
  await commit(cwd, "feat: initial release");
  await addTag(cwd, "v1.0.0");
  await addNote(cwd, "v1.0.0", [
    { name: "npm package", channels: [null, "next"], pluginName: "npm" },
  ]);

  await checkoutBranch(cwd, "next");
  await writeFile(cwd, ["file2.js"]);
  await addFiles(cwd);
  await commit(
    cwd,
    "feat: breaking change\n\nBREAKING CHANGE: break something",
  );
  await addTag(cwd, "v2.0.0");
  await addNote(cwd, "v2.0.0", [
    { name: "npm package", channels: ["next"], pluginName: "npm" },
  ]);
  await writeFile(cwd, ["file3.js"]);
  await addFiles(cwd);
  const hash201 = await commit(cwd, "fix: a fix");
  await addTag(cwd, "v2.0.1");
  await addNote(cwd, "v2.0.1", [
    { name: "npm package", channels: ["next"], pluginName: "npm" },
  ]);
  await writeFile(cwd, ["file4.js"]);
  await addFiles(cwd);
  await commit(cwd, "feat: a feature");
  await addTag(cwd, "v2.1.0");
  await addNote(cwd, "v2.1.0", [
    { name: "npm package", channels: ["next"], pluginName: "npm" },
  ]);
  await pushBranch(cwd, url, "next");

  await checkoutBranch(cwd, "main");
  // Merge all commits but last one from next to master
  await fn(cwd, "next~1");
  await pushBranch(cwd, url, "main");

  const env: Record<string, unknown> = {};

  const notes = "Release notes";
  const findPackages = vi
    .fn()
    .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
  const verifyConditions = vi.fn();
  const verifyRelease = vi.fn();
  const generateNotes = vi.fn().mockResolvedValue(notes);
  const release1 = { name: "Release 1", url: "https://release1.com" };
  const release2 = { name: "Release 2", url: "https://release2.com" };
  const addChannels1 = vi.fn().mockResolvedValue(release1);
  const addChannels2 = vi.fn();
  const prepare = vi.fn();
  const publish = vi.fn().mockResolvedValue(release2);
  const success = vi.fn();

  const options = {
    packages: [
      {
        paths: ["./"],
        findPackages: [findPackages],
        verifyConditions: [verifyConditions],
        verifyRelease: [verifyRelease],
        addChannels: [addChannels1, addChannels2],
        generateNotes: [generateNotes],
        prepare: [prepare],
        publish: [publish],
        success: [success],
      },
    ],
  };

  const envCiResults = { branch: "main", isCi: true, isPr: false };
  vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

  await expect(
    new LetsRelease().run(options, {
      cwd,
      env,
      stdout: new WritableStreamBuffer(),
      stderr: new WritableStreamBuffer(),
    } as unknown as Context),
  ).resolves.toEqual([
    expect.objectContaining({
      version: "2.0.1",
      tag: "v2.0.1",
      hash: hash201,
      artifacts: expect.arrayContaining([
        expect.objectContaining({
          ...release1,
          channels: [null],
          pluginName: "[Function: Mock]",
        }),
      ]),
    }),
  ]);

  // Verify the tag has been created on the local and remote repo and reference
  await expect(getTagHash("v2.0.1", { cwd })).resolves.toBe(hash201);
  await expect(getRemoteTagHash(cwd, url, "v2.0.1")).resolves.toBe(hash201);
}

describe("LetsRelease", () => {
  beforeEach(() => {
    logger.log.mockClear();
    logger.error.mockClear();
    logger.success.mockClear();
    logger.warn.mockClear();
    logger.scope.mockClear();
  });

  it("should run plugin steps with expected values", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    const hash100 = await commit(cwd, "First");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      { name: "npm package", channels: ["next"], pluginName: "npm" },
    ]);
    const hash110 = await commit(cwd, "Second");

    await checkoutBranch(cwd, "next");
    await pushBranch(cwd, url, "next");
    await checkoutBranch(cwd, "main");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const notes1 = "Release notes 1";
    const notes2 = "Release notes 2";
    const notes3 = "Release notes 3";
    const findPackages = vi
      .fn<StepFunction<Step.findPackages>>()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions1 = vi.fn<StepFunction<Step.verifyConditions>>();
    const verifyConditions2 = vi.fn<StepFunction<Step.verifyConditions>>();
    const analyzeCommits = vi
      .fn<StepFunction<Step.analyzeCommits>>()
      .mockResolvedValue(ReleaseType.minor);
    const verifyRelease = vi.fn<StepFunction<Step.verifyRelease>>();
    const generateNotes1 = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue(notes1);
    const generateNotes2 = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue(notes2);
    const generateNotes3 = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue(notes3);
    const release1 = { name: "Release 1", url: "https://release1.com" };
    const release2 = { name: "Release 2", url: "https://release2.com" };
    const addChannels = vi
      .fn<StepFunction<Step.addChannels>>()
      .mockResolvedValue(release1);
    const prepare = vi.fn<StepFunction<Step.prepare>>();
    const publish1 = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(release2);
    const publish2 = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(undefined);
    const success = vi.fn<StepFunction<Step.success>>();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions1, verifyConditions2],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          generateNotes: [generateNotes1, generateNotes2, generateNotes3],
          prepare: [prepare],
          publish: [publish1, publish2],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    const lastRelease = {
      hash: hash100,
      version: "1.0.0",
      tag: "v1.0.0",
      artifacts: [
        { name: "npm package", channels: ["next"], pluginName: "npm" },
      ],
    };
    const nextRelease = {
      hash: hash110,
      version: "1.1.0",
      tag: "v1.1.0",
      artifacts: [],
      channels: [null],
    };
    const releases = [
      {
        tag: "v1.0.0",
        hash: hash100,
        version: "1.0.0",
        channels: {
          default: [null],
        },
        artifacts: [
          {
            ...release1,
            pluginName: "[Function: Mock]",
            channels: [null],
          },
        ],
      },
      {
        tag: "v1.1.0",
        hash: hash110,
        version: "1.1.0",
        artifacts: [
          {
            ...release2,
            pluginName: "[Function: Mock]",
            channels: [null],
          },
        ],
        channels: {
          default: [null],
        },
        notes: `${notes1}\n\n${notes2}\n\n${notes3}`,
      },
    ];
    const result = await new LetsRelease().run(options, {
      cwd,
      env,
      stdout: new WritableStreamBuffer(),
      stderr: new WritableStreamBuffer(),
    } as unknown as Context);

    expect(result).toEqual(releases);

    const parsedOptions = await Options.parseAsync({
      ...options,
      repositoryUrl: url,
    });
    const normalizedOptions = {
      ...parsedOptions,
      packages: parsedOptions.packages.map((p) => ({
        ...p,
        ...Object.fromEntries(
          Object.values(Step).map((step) => [
            step,
            p[step]?.map(() => expect.any(Function)),
          ]),
        ),
      })),
    };
    const context = {
      cwd,
      env: {
        GIT_ASKPASS: "echo",
        GIT_AUTHOR_EMAIL: defaultGitUserEmail,
        GIT_AUTHOR_NAME: defaultGitUserName,
        GIT_COMMITTER_EMAIL: defaultGitUserEmail,
        GIT_COMMITTER_NAME: defaultGitUserName,
        GIT_TERMINAL_PROMPT: 0,
      },
      logger,
      ciEnv: envCiResults,
      repositoryRoot: cwd,
      options: normalizedOptions,
      packageOptions: normalizedOptions.packages[0],
    };

    expect(findPackages).toHaveBeenCalledTimes(1);
    expect(findPackages).toHaveBeenCalledWith(
      expect.objectContaining(context),
      {},
    );

    const packages = [
      expect.objectContaining({ path: cwd, type: "npm", name: "main" }),
    ];
    const mainBranch = {
      name: "main",
      channels: { default: [null] },
      ranges: {
        main: { min: "1.0.1", max: "2.0.0" },
      },
      tags: {
        main: [
          {
            artifacts: [
              { channels: ["next"], name: "npm package", pluginName: "npm" },
            ],
            package: "main",
            tag: "v1.0.0",
            version: "1.0.0",
          },
        ],
      },
      type: BranchType.main,
    };
    const nextBranch = {
      name: "next",
      channels: { default: ["next"] },
      ranges: {
        main: { min: "2.0.0", max: undefined },
      },
      tags: {
        main: [
          {
            artifacts: [
              { channels: ["next"], name: "npm package", pluginName: "npm" },
            ],
            package: "main",
            tag: "v1.0.0",
            version: "1.0.0",
          },
        ],
      },
      type: BranchType.next,
    };
    const branches = expect.objectContaining({
      main: mainBranch,
      next: nextBranch,
    });
    const verifyConditionsContext = {
      ...context,
      packageOptions: normalizedOptions.packages[0],
      packages,
      branches,
      branch: mainBranch,
    };

    expect(verifyConditions1).toHaveBeenCalledTimes(1);
    expect(verifyConditions1).toHaveBeenCalledWith(
      expect.objectContaining(verifyConditionsContext),
      {},
    );

    expect(verifyConditions2).toHaveBeenCalledTimes(1);
    expect(verifyConditions2).toHaveBeenCalledWith(
      expect.objectContaining(verifyConditionsContext),
      {},
    );

    const pkgs = [
      {
        path: cwd,
        type: "npm",
        name: "main",
        uniqueName: "main",
      },
    ] as Package[];
    const commits = await getCommits(
      {
        repositoryRoot: cwd,
        options: {},
        packages: pkgs,
      } as VerifyConditionsContext,
      pkgs,
    );
    const baseAddChannelsContext = {
      ...verifyConditionsContext,
      package: packages[0],
      commits: commits.main?.slice(1),
      lastRelease: undefined,
    };

    expect(generateNotes1).toHaveBeenCalledTimes(2);
    expect(generateNotes1).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ...baseAddChannelsContext,
        nextRelease: {
          ...omit(lastRelease, "artifacts"),
          channels: [null],
        },
      }),
      {},
    );

    expect(generateNotes2).toHaveBeenCalledTimes(2);
    expect(generateNotes2).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ...baseAddChannelsContext,
        nextRelease: {
          ...omit(lastRelease, "artifacts"),
          channels: [null],
          notes: notes1,
        },
      }),
      {},
    );

    expect(generateNotes3).toHaveBeenCalledTimes(2);
    expect(generateNotes3).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ...baseAddChannelsContext,
        nextRelease: {
          ...omit(lastRelease, "artifacts"),
          channels: [null],
          notes: `${notes1}\n\n${notes2}`,
        },
      }),
      {},
    );

    expect(addChannels).toHaveBeenCalledTimes(1);
    expect(addChannels).toHaveBeenCalledWith(
      expect.objectContaining({
        ...baseAddChannelsContext,
        currentRelease: lastRelease,
        nextRelease: {
          ...omit(lastRelease, "artifacts"),
          channels: [null],
          notes: `${notes1}\n\n${notes2}\n\n${notes3}`,
        },
      }),
      {},
    );

    const newArtifact = {
      ...release1,
      channels: [null],
      pluginName: "[Function: Mock]",
    };
    const updatedArtifacts = [...lastRelease.artifacts, newArtifact];
    const updatedMainBranch = {
      ...mainBranch,
      tags: {
        main: mainBranch.tags.main.map((tag) => {
          if (tag.version !== lastRelease.version) {
            return tag;
          }

          return {
            ...tag,
            artifacts: updatedArtifacts,
          };
        }),
      },
    };
    const updateBranches = expect.objectContaining({
      main: updatedMainBranch,
      next: nextBranch,
    });
    const updatedLastRelease = {
      ...lastRelease,
      package: "main",
      artifacts: updatedArtifacts,
    };

    expect(success).toHaveBeenCalledTimes(2);
    expect(success).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        ...context,
        packageOptions: normalizedOptions.packages[0],
        packages,
        branches: updateBranches,
        branch: updatedMainBranch,
        package: packages[0],
        commits: commits.main?.slice(1),
        lastRelease: undefined,
        nextRelease: {
          ...omit(lastRelease, "artifacts"),
          channels: [null],
          notes: `${notes1}\n\n${notes2}\n\n${notes3}`,
        },
        releases: [
          {
            ...lastRelease,
            artifacts: [newArtifact],
            channels: { default: [null] },
          },
        ],
      }),
      {},
    );

    const analyzeCommitsContext = {
      ...context,
      packageOptions: normalizedOptions.packages[0],
      packages,
      branches: updateBranches,
      branch: updatedMainBranch,
      package: packages[0],
      commits: commits.main?.slice(0, -1),
      lastRelease: updatedLastRelease,
    };

    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(analyzeCommits).toHaveBeenCalledWith(
      expect.objectContaining(analyzeCommitsContext),
      {},
    );

    expect(verifyRelease).toHaveBeenCalledTimes(1);
    expect(verifyRelease).toHaveBeenCalledWith(
      expect.objectContaining({
        ...analyzeCommitsContext,
        nextRelease,
      }),
      {},
    );

    expect(generateNotes1).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ...analyzeCommitsContext,
        nextRelease,
      }),
      {},
    );

    expect(generateNotes2).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ...analyzeCommitsContext,
        nextRelease: {
          ...nextRelease,
          notes: notes1,
        },
      }),
      {},
    );

    expect(generateNotes3).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ...analyzeCommitsContext,
        nextRelease: {
          ...nextRelease,
          notes: `${notes1}\n\n${notes2}`,
        },
      }),
      {},
    );

    const prepareContext = {
      ...analyzeCommitsContext,
      nextRelease: {
        ...nextRelease,
        notes: `${notes1}\n\n${notes2}\n\n${notes3}`,
      },
    };

    expect(prepare).toHaveBeenCalledTimes(1);
    expect(prepare).toHaveBeenCalledWith(
      expect.objectContaining(prepareContext),
      {},
    );

    expect(publish1).toHaveBeenCalledTimes(1);
    expect(publish1).toHaveBeenCalledWith(
      expect.objectContaining(prepareContext),
      {},
    );

    expect(publish2).toHaveBeenCalledTimes(1);
    expect(publish2).toHaveBeenCalledWith(
      expect.objectContaining(prepareContext),
      {},
    );

    const artifact = {
      ...release2,
      channels: [null],
      pluginName: "[Function: Mock]",
    };

    expect(success).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ...prepareContext,
        releases: [
          {
            ...nextRelease,
            artifacts: [artifact],
            channels: { default: [null] },
            notes: `${notes1}\n\n${notes2}\n\n${notes3}`,
          },
        ],
      }),
      {},
    );

    // Verify the tag has been created on the local and remote repo and reference the gitHead
    await expect(getTagHash(nextRelease.tag, { cwd })).resolves.toBe(
      nextRelease.hash,
    );
    await expect(getRemoteTagHash(cwd, url, nextRelease.tag)).resolves.toBe(
      nextRelease.hash,
    );
  });

  it("should use custom tag format", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "First");
    await addTag(cwd, "test-1.0.0");
    await addNote(cwd, "test-1.0.0", [
      { name: "npm package", channels: [null], pluginName: "npm" },
    ]);
    const hash200 = await commit(cwd, "Second");

    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const notes = "Release notes";
    const findPackages = vi
      .fn<StepFunction<Step.findPackages>>()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn<StepFunction<Step.verifyConditions>>();
    const analyzeCommits = vi
      .fn<StepFunction<Step.analyzeCommits>>()
      .mockResolvedValue(ReleaseType.major);
    const verifyRelease = vi.fn<StepFunction<Step.verifyRelease>>();
    const generateNotes = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue(notes);
    const release1 = { name: "Release 1", url: "https://release1.com" };
    const release2 = { name: "Release 2", url: "https://release2.com" };
    const addChannels = vi
      .fn<StepFunction<Step.addChannels>>()
      .mockResolvedValue(release1);
    const prepare = vi.fn<StepFunction<Step.prepare>>();
    const publish = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(release2);
    const success = vi.fn<StepFunction<Step.success>>();
    const fail = vi.fn<StepFunction<Step.fail>>();

    const options = {
      tagFormat: "test-${version}",
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          generateNotes: [generateNotes],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    const nextRelease = {
      hash: hash200,
      version: "2.0.0",
      tag: "test-2.0.0",
      artifacts: [],
      channels: [null],
    };

    // Verify the tag has been created on the local and remote repo and reference the gitHead
    await expect(getTagHash(nextRelease.tag, { cwd })).resolves.toBe(
      nextRelease.hash,
    );
    await expect(getRemoteTagHash(cwd, url, nextRelease.tag)).resolves.toBe(
      nextRelease.hash,
    );
  });

  it("should use new git head, and re-create release notes if a prepare plugin step create a commit", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "First");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      { name: "npm package", channels: [null], pluginName: "npm" },
    ]);
    const originHash = await commit(cwd, "Second");

    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    let newHash: string | undefined = undefined;
    const notes = "Release notes";
    const findPackages = vi
      .fn<StepFunction<Step.findPackages>>()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn<StepFunction<Step.verifyConditions>>();
    const analyzeCommits = vi
      .fn<StepFunction<Step.analyzeCommits>>()
      .mockResolvedValue(ReleaseType.major);
    const verifyRelease = vi.fn<StepFunction<Step.verifyRelease>>();
    const generateNotes = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue(notes);
    const release1 = { name: "Release 1", url: "https://release1.com" };
    const release2 = { name: "Release 2", url: "https://release2.com" };
    const addChannels = vi
      .fn<StepFunction<Step.addChannels>>()
      .mockResolvedValue(release1);
    const prepare1 = vi
      .fn<StepFunction<Step.prepare>>()
      .mockImplementation(async () => {
        newHash = await commit(cwd, "Third");
      });
    const prepare2 = vi.fn<StepFunction<Step.prepare>>();
    const publish = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(release2);
    const success = vi.fn<StepFunction<Step.success>>();
    const fail = vi.fn<StepFunction<Step.fail>>();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          generateNotes: [generateNotes],
          prepare: [prepare1, prepare2],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    const nextRelease = {
      hash: originHash,
      version: "2.0.0",
      tag: "v2.0.0",
      artifacts: [],
      channels: [null],
    };

    expect(generateNotes).toHaveBeenCalledTimes(2);
    expect(generateNotes).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ nextRelease }),
      {},
    );

    expect(prepare1).toHaveBeenCalledTimes(1);
    expect(prepare1).toHaveBeenCalledWith(
      expect.objectContaining({
        nextRelease: {
          ...nextRelease,
          notes,
        },
      }),
      {},
    );

    expect(generateNotes).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        nextRelease: {
          ...nextRelease,
          hash: newHash,
          notes,
        },
      }),
      {},
    );

    expect(prepare2).toHaveBeenCalledTimes(1);
    expect(prepare2).toHaveBeenCalledWith(
      expect.objectContaining({
        nextRelease: {
          ...nextRelease,
          hash: newHash,
          notes,
        },
      }),
      {},
    );

    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        nextRelease: {
          ...nextRelease,
          hash: newHash,
          notes,
        },
      }),
      {},
    );

    // Verify the tag has been created on the local and remote repo and reference the last gitHead
    await expect(getTagHash(nextRelease.tag, { cwd })).resolves.toBe(newHash);
    await expect(getRemoteTagHash(cwd, url, nextRelease.tag)).resolves.toBe(
      newHash,
    );
  });

  it("should make a new release when a commit is forward-ported to an upper branch", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file1.js"]);
    await addFiles(cwd);
    await commit(cwd, "feat: initial release");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      {
        name: "npm package",
        channels: [null, "1.0.x"],
        pluginName: "[Function: Mock]",
      },
    ]);

    await checkoutBranch(cwd, "1.0.x");
    await writeFile(cwd, ["file2.js"]);
    await addFiles(cwd);
    await commit(cwd, "fix: fix on maintenance version 1.0.x");
    await addTag(cwd, "v1.0.1");
    await addNote(cwd, "v1.0.1", [
      {
        name: "npm package",
        channels: ["1.0.x"],
        pluginName: "[Function: Mock]",
      },
    ]);
    await pushBranch(cwd, url, "1.0.x");

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file3.js"]);
    await addFiles(cwd);
    await commit(cwd, "feat: new feature on main");
    await addTag(cwd, "v1.1.0");
    await mergeBranch(cwd, "1.0.x");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn<StepFunction<Step.findPackages>>()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn<StepFunction<Step.verifyConditions>>();
    const verifyRelease = vi.fn<StepFunction<Step.verifyRelease>>();
    const release1 = { name: "Release 1", url: "https://release1.com" };
    const release2 = { name: "Release 2", url: "https://release2.com" };
    const addChannels = vi
      .fn<StepFunction<Step.addChannels>>()
      .mockResolvedValue(release1);
    const prepare = vi.fn<StepFunction<Step.prepare>>();
    const publish = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(release2);
    const success = vi.fn<StepFunction<Step.success>>();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(addChannels).not.toHaveBeenCalled();

    // The release 1.1.1, triggered by the forward-port of "fix: fix on maintenance version 1.0.x" has been published from master
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        nextRelease: expect.objectContaining({
          version: "1.1.1",
        }),
      }),
      {},
    );

    expect(success).toHaveBeenCalledTimes(1);
  });

  it("should publish a pre-release version", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file1.js"]);
    await addFiles(cwd);
    await commit(cwd, "feat: initial release");
    await addTag(cwd, "v1.0.0");
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "beta");
    await writeFile(cwd, ["file2.js"]);
    await addFiles(cwd);
    await commit(cwd, "feat: a feature");
    await pushBranch(cwd, url, "beta");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn<StepFunction<Step.findPackages>>()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn<StepFunction<Step.verifyConditions>>();
    const verifyRelease = vi.fn<StepFunction<Step.verifyRelease>>();
    const generateNotes = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue("");
    const release1 = { name: "Release 1", url: "https://release1.com" };
    const release2 = { name: "Release 2", url: "https://release2.com" };
    const addChannels = vi
      .fn<StepFunction<Step.addChannels>>()
      .mockResolvedValue(release1);
    const prepare = vi.fn<StepFunction<Step.prepare>>();
    const publish = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(release2);
    const success = vi.fn<StepFunction<Step.success>>();
    const fail = vi.fn<StepFunction<Step.fail>>();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          generateNotes: [generateNotes],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "beta", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual([
      expect.objectContaining({
        version: "1.1.0-beta.1",
        tag: "v1.1.0-beta.1",
      }),
    ]);

    await expect(getNote("v1.1.0-beta.1", { cwd })).resolves.toEqual({
      artifacts: [
        expect.objectContaining({
          channels: ["beta"],
        }),
      ],
    });

    await writeFile(cwd, ["file3.js"]);
    await addFiles(cwd);
    await commit(cwd, "fix: a fix");
    await pushBranch(cwd, url, "beta");

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual([
      expect.objectContaining({
        version: "1.1.0-beta.2",
        tag: "v1.1.0-beta.2",
      }),
    ]);

    await expect(getNote("v1.1.0-beta.2", { cwd })).resolves.toEqual({
      artifacts: [
        expect.objectContaining({
          channels: ["beta"],
        }),
      ],
    });
  });

  it("should not add pre-releases to a different channel", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file1.js"]);
    await addFiles(cwd);
    await commit(cwd, "feat: initial release");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      { name: "npm package", channels: [null], pluginName: "npm" },
    ]);

    await checkoutBranch(cwd, "beta");
    await writeFile(cwd, ["file2.js"]);
    await addFiles(cwd);
    await commit(
      cwd,
      "feat: breaking change\n\nBREAKING CHANGE: break something",
    );
    await addTag(cwd, "v2.0.0-beta.1");
    await addNote(cwd, "v2.0.0-beta.1", [
      { name: "npm package", channels: ["beta"], pluginName: "npm" },
    ]);
    await writeFile(cwd, ["file3.js"]);
    await addFiles(cwd);
    await commit(cwd, "fix: a fix");
    await addTag(cwd, "v2.0.0-beta.2");
    await addNote(cwd, "v2.0.0-beta.2", [
      { name: "npm package", channels: ["beta"], pluginName: "npm" },
    ]);
    await pushBranch(cwd, url, "beta");

    await checkoutBranch(cwd, "main");
    await mergeBranch(cwd, "beta");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn<StepFunction<Step.findPackages>>()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn<StepFunction<Step.verifyConditions>>();
    const verifyRelease = vi.fn<StepFunction<Step.verifyRelease>>();
    const generateNotes = vi
      .fn<StepFunction<Step.generateNotes>>()
      .mockResolvedValue("Release notes");
    const release1 = { name: "Release 1", url: "https://release1.com" };
    const release2 = { name: "Release 2", url: "https://release2.com" };
    const addChannels = vi
      .fn<StepFunction<Step.addChannels>>()
      .mockResolvedValue(release1);
    const prepare = vi.fn<StepFunction<Step.prepare>>();
    const publish = vi
      .fn<StepFunction<Step.publish>>()
      .mockResolvedValue(release2);
    const success = vi.fn<StepFunction<Step.success>>();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          generateNotes: [generateNotes],
          prepare: [prepare],
          publish: [publish],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "beta", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(addChannels).not.toHaveBeenCalled();
  });

  // eslint-disable-next-line vitest/expect-expect
  it("should add version to channels after a fast-forward merge", async () =>
    await testAddChannels(
      async (cwd, ref) => await mergeBranch(cwd, ref, true),
    ));

  // eslint-disable-next-line vitest/expect-expect
  it("should add version to channels after a non fast-forward merge", async () =>
    await testAddChannels(
      async (cwd, ref) => await mergeBranch(cwd, ref, false),
    ));

  // eslint-disable-next-line vitest/expect-expect
  it("should add version to channels after a rebase", async () =>
    await testAddChannels(async (cwd, ref) => await rebaseBranch(cwd, ref)));

  it('should call all "success" plugins even if one errors out', async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      { name: "npm package", channels: [null, "next"], pluginName: "npm" },
    ]);
    const hash = await commit(cwd, "second");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const notes = "Release notes";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions1 = vi.fn();
    const verifyConditions2 = vi.fn();
    const verifyRelease = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.major);
    const generateNotes = vi.fn().mockResolvedValue(notes);
    const release = { name: "Release", url: "https://release.com" };
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn().mockResolvedValue(release);
    const success1 = vi.fn().mockRejectedValue(new Error("Error"));
    const success2 = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions1, verifyConditions2],
          verifyRelease: [verifyRelease],
          analyzeCommits: [analyzeCommits],
          addChannels: [addChannels],
          generateNotes: [generateNotes],
          prepare: [prepare],
          publish: [publish],
          success: [success1, success2],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toThrowError();

    expect(success1).toHaveBeenCalledTimes(1);
    expect(success1).toHaveBeenCalledWith(
      expect.objectContaining({
        releases: [
          expect.objectContaining({
            version: "2.0.0",
            tag: "v2.0.0",
            hash,
            notes,
            artifacts: [
              expect.objectContaining({
                ...release,
                channels: [null],
                pluginName: "[Function: Mock]",
              }),
            ],
          }),
        ],
      }),
      {},
    );

    expect(success2).toHaveBeenCalledTimes(1);
    expect(success2).toHaveBeenCalledWith(
      expect.objectContaining({
        releases: [
          expect.objectContaining({
            version: "2.0.0",
            tag: "v2.0.0",
            hash,
            notes,
            artifacts: [
              expect.objectContaining({
                ...release,
                channels: [null],
                pluginName: "[Function: Mock]",
              }),
            ],
          }),
        ],
      }),
      {},
    );
  });

  it("should skip steps addChannels, prepare, publish and success in dry-run mode", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      { name: "npm package", channels: [null, "next"], pluginName: "npm" },
    ]);
    await commit(cwd, "second");
    await addTag(cwd, "v1.1.0");
    await addNote(cwd, "v1.1.0", [
      { name: "npm package", channels: ["next"], pluginName: "npm" },
    ]);
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "next");
    await pushBranch(cwd, url, "next");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.minor);
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();

    const options = {
      dryRun: true,
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(findPackages).toHaveBeenCalledTimes(1);
    expect(verifyConditions).toHaveBeenCalledTimes(1);
    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(verifyRelease).toHaveBeenCalledTimes(1);
    expect(generateNotes).toHaveBeenCalledTimes(2);
    expect(addChannels).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({
      prefix: "[main]",
      message: `Skip step addChannels in dry-run mode`,
    });
    expect(prepare).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({
      prefix: "[main]",
      message: `Skip step prepare in dry-run mode`,
    });
    expect(publish).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({
      prefix: "[main]",
      message: `Skip step publish in dry-run mode`,
    });
    expect(success).not.toHaveBeenCalled();
    expect(logger.warn).toHaveBeenCalledWith({
      prefix: "[main]",
      message: `Skip step success in dry-run mode`,
    });
  });

  it('should force a dry-run if not on a CI and "skipCiVerifications" is not explicitly set', async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const notes = "Release notes";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.major);
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn().mockResolvedValue(notes);
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: false, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(logger.warn).toHaveBeenCalledWith(
      "NOT triggered in a known CI environment, running in dry-run mode",
    );
    expect(findPackages).toHaveBeenCalledTimes(1);
    expect(verifyConditions).toHaveBeenCalledTimes(1);
    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(verifyRelease).toHaveBeenCalledTimes(1);
    expect(generateNotes).toHaveBeenCalledTimes(1);
    expect(addChannels).not.toHaveBeenCalled();
    expect(prepare).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(fail).not.toHaveBeenCalled();
  });

  it("should print changelog in dry-run mode", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const notes = "Release notes";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.major);
    const generateNotes = vi.fn().mockResolvedValue(notes);

    const options = {
      dryRun: true,
      packages: [
        {
          paths: ["./"],
          plugins: [],
          findPackages: [findPackages],
          analyzeCommits: [analyzeCommits],
          generateNotes: [generateNotes],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(logger.log).toHaveBeenCalledWith({
      prefix: "[main]",
      message: "Release note for version 2.0.0:",
    });
  });

  it('should allow local releases with "skipCiVerifications" option', async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const notes = "Release notes";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.major);
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn().mockResolvedValue(notes);
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      skipCiVerifications: true,
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: false, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(logger.log).not.toHaveBeenCalledWith(
      "Triggered by a pull request, skip releasing",
    );
    expect(logger.warn).not.toHaveBeenCalledWith(
      "NOT triggered in a known CI environment, running in dry-run mode",
    );

    expect(findPackages).toHaveBeenCalledTimes(1);
    expect(verifyConditions).toHaveBeenCalledTimes(1);
    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(verifyRelease).toHaveBeenCalledTimes(1);
    expect(generateNotes).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(success).toHaveBeenCalledTimes(1);
  });

  it('should accept "undefined" value returned by "generateNotes", "publish" and "addChannel"', async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      { name: "npm package", channels: [null, "next"], pluginName: "npm" },
    ]);
    const hash = await commit(cwd, "second");
    await addTag(cwd, "v1.1.0");
    await addNote(cwd, "v1.1.0", [
      { name: "npm package", channels: ["next"], pluginName: "npm" },
    ]);
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "next");
    await pushBranch(cwd, url, "next");

    await checkoutBranch(cwd, "main");

    const env: Record<string, unknown> = {};

    const notes = "Release notes 2";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.minor);
    const verifyRelease = vi.fn();
    const generateNotes1 = vi.fn();
    const generateNotes2 = vi.fn().mockResolvedValue(notes);
    const addChannels = vi
      .fn()
      .mockResolvedValue({ name: "test1", url: "https://test1.com" });
    const prepare = vi.fn();
    const publish = vi
      .fn()
      .mockResolvedValue({ name: "test2", url: "https://test2.com" });
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes1, generateNotes2],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual(expect.arrayContaining([]));

    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(verifyRelease).toHaveBeenCalledTimes(1);
    expect(generateNotes1).toHaveBeenCalledTimes(2);
    expect(generateNotes2).toHaveBeenCalledTimes(2);
    expect(addChannels).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledTimes(1);
    expect(publish).toHaveBeenCalledWith(
      expect.objectContaining({
        nextRelease: {
          hash,
          version: "1.2.0",
          tag: "v1.2.0",
          artifacts: [],
          channels: [null],
          notes,
        },
      }),
      {},
    );
    expect(success).toHaveBeenCalledTimes(2);
    expect(success).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        releases: expect.arrayContaining([
          expect.objectContaining({
            artifacts: expect.arrayContaining([
              expect.objectContaining({
                pluginName: "[Function: Mock]",
              }),
            ]),
          }),
        ]),
      }),
      {},
    );
    expect(success).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        releases: expect.arrayContaining([
          expect.objectContaining({
            artifacts: expect.arrayContaining([
              expect.objectContaining({
                pluginName: "[Function: Mock]",
              }),
            ]),
          }),
        ]),
      }),
      {},
    );
  });

  it("should return undefined if triggered by a PR", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
        },
      ],
    };

    const envCiResults = {
      branch: "main",
      isCi: true,
      isPr: true,
      prBranch: "patch-1",
    };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toBeUndefined();

    expect(logger.log).toHaveBeenCalledWith(
      "Triggered by a pull request, skip releasing",
    );
  });

  it("should throw error if next release is out of range of the current maintenance branch", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: initial commit");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      {
        name: "npm package",
        channels: [null, "1.x"],
        pluginName: "[Function: Mock]",
      },
    ]);

    await checkoutBranch(cwd, "1.x");
    await writeFile(cwd, ["file.txt"], "test");
    await addFiles(cwd);
    await commit(cwd, "feat: feature on maintenance branch 1.x");
    await pushBranch(cwd, url, "1.x");

    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: new feature on main");
    await addTag(cwd, "v1.1.0");
    await addNote(cwd, "v1.1.0", [
      { name: "npm package", channels: [null], pluginName: "[Function: Mock]" },
    ]);
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "1.x");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const verifyRelease = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "1.x", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(InvalidNextVersionError)],
          }),
        ],
      }),
    );
  });

  it("should throw error if next release is out of range of the current release branch", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: initial commit");
    await addTag(cwd, "v1.0.0");

    await checkoutBranch(cwd, "next");
    await commit(cwd, "feat: new feature on next");
    await addTag(cwd, "v1.1.0");
    await addNote(cwd, "v1.1.0", [
      {
        name: "npm package",
        channels: [null],
        pluginName: "[Function: Mock]",
      },
    ]);
    await pushBranch(cwd, url, "next");

    await checkoutBranch(cwd, "next-major");
    await pushBranch(cwd, url, "next-major");

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file.txt"], "test");
    await addFiles(cwd);
    await commit(cwd, "feat: new feature on main");
    await commit(cwd, "fix: new fix on main");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const verifyRelease = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          verifyRelease: [verifyRelease],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(InvalidNextVersionError)],
          }),
        ],
      }),
    );
  });

  it("should throw error if merge an out of range release in a maintenance branch", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", [
      {
        name: "npm package",
        channels: [null, "1.1.x"],
        pluginName: "[Function: Mock]",
      },
    ]);
    await commit(cwd, "second");
    await addTag(cwd, "v1.1.0");
    await addNote(cwd, "v1.1.0", [
      {
        name: "npm package",
        channels: [null, "1.1.x"],
        pluginName: "[Function: Mock]",
      },
    ]);

    await checkoutBranch(cwd, "1.1.x");
    await pushBranch(cwd, url, "1.1.x");

    await checkoutBranch(cwd, "main");
    await commit(cwd, "third");
    await addTag(cwd, "v1.1.1");
    await addNote(cwd, "v1.1.1", [
      {
        name: "npm package",
        channels: [null],
        pluginName: "[Function: Mock]",
      },
    ]);
    await commit(cwd, "fourth");
    await addTag(cwd, "v1.2.0");
    await addNote(cwd, "v1.2.0", [
      {
        name: "npm package",
        channels: [null],
        pluginName: "[Function: Mock]",
      },
    ]);
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "1.1.x");
    await mergeBranch(cwd, "main");
    await pushBranch(cwd, url, "1.1.x");

    const env: Record<string, unknown> = {};

    const notes = "Release notes";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn();
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn().mockResolvedValue(notes);
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
        },
      ],
    };

    const envCiResults = { branch: "1.1.x", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(InvalidMaintenanceMergeError)],
          }),
        ],
      }),
    );

    expect(addChannels).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
    expect(success).not.toHaveBeenCalled();
    expect(fail).not.toHaveBeenCalled();
  });

  it("should return undefined if triggered on an outdated clone", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await commit(cwd, "second");
    await pushBranch(cwd, url, "main");

    const shallowCwd = await cloneRepo(url, "main", 1);

    await commit(shallowCwd, "third");
    await pushBranch(shallowCwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toBeUndefined();

    expect(logger.log).toHaveBeenCalledWith(
      "The local branch main is not up to date, skip releasing",
    );
  });

  it("should returns undefined if not running from the configured branch", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
        },
      ],
    };

    const envCiResults = { branch: "other-branch", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toBeUndefined();

    expect(logger.log).toHaveBeenCalledWith(
      "Triggered on the branch other-branch, while configured branches are [main], skip releasing",
    );
  });

  it("should returns undefined if there is no relevant changes", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn();
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual([]);

    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(verifyRelease).not.toHaveBeenCalled();
    expect(generateNotes).not.toHaveBeenCalled();
    expect(publish).not.toHaveBeenCalled();
    expect(logger.log).toHaveBeenCalledWith({
      prefix: "[main]",
      message: "There are no relevant changes, so no new version is released",
    });
  });

  it("should exclude commits with [skip release] or [release skip] from analysis", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");

    const messages = [
      "Test commit",
      "Test commit [skip release]",
      "Test commit [release skip]",
      "Test commit [Release Skip]",
      "Test commit [Skip Release]",
      "Test commit [skip    release]",
      "Test commit\n\n commit body\n[skip release]",
      "Test commit\n\n commit body\n[release skip]",
    ];

    for (const [index, msg] of messages.entries()) {
      await writeFile(cwd, [`file${index}.txt`], "test");
      await addFiles(cwd);
      await commit(cwd, msg);
    }

    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn();
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual([]);

    const packages = [
      {
        path: cwd,
        type: "npm",
        name: "main",
        uniqueName: "main",
      },
    ] as Package[];
    const commits = await getCommits(
      { repositoryRoot: cwd, options: {}, packages } as VerifyConditionsContext,
      packages,
    );

    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(analyzeCommits).toHaveBeenCalledWith(
      expect.objectContaining({
        commits: expect.arrayContaining(
          commits.main?.filter(({ message }) => !/skip/i.test(message)) ?? [],
        ),
      }),
      {},
    );
  });

  it("should log both publish errors and fail errors", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file.txt"], "test");
    await addFiles(cwd);
    await commit(cwd, "feat: new feature on main");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const publishError = new Error("Publish error");
    const failError = new Error("Fail error");
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.minor);
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn().mockRejectedValue(publishError);
    const success = vi.fn();
    const fail = vi.fn().mockRejectedValue(failError);

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [publishError, failError],
          }),
        ],
      }),
    );

    expect(logger.error).toHaveBeenCalledWith({
      prefix: "[main]",
      message: [`An error occurred while running ${name}: %O`, publishError],
    });
    expect(logger.error).toHaveBeenCalledWith({
      prefix: "[main]",
      message: [`An error occurred while running ${name}: %O`, failError],
    });
  });

  it("should throw error if repositoryUrl is not set and cannot be found from repo config", async () => {
    const cwd = await initRepo();

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.minor);
    const verifyRelease = vi.fn();
    const generateNotes = vi.fn();
    const addChannels = vi.fn();
    const prepare = vi.fn();
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          verifyRelease: [verifyRelease],
          generateNotes: [generateNotes],
          addChannels: [addChannels],
          prepare: [prepare],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(expect.any(ZodError));
  });

  it("should throw error if step returns an unexpected value", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = {};

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue("string");
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(InvalidStepResultError)],
          }),
        ],
      }),
    );
  });

  it("should hide sensitive information passed to fail step", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = { MY_TOKEN: "secret token" };

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.minor);
    const publish = vi
      .fn()
      .mockRejectedValue(new Error(`Exposing token ${env.MY_TOKEN as string}`));
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          plugins: [],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).rejects.toEqual(
      expect.objectContaining({
        errors: [
          expect.objectContaining({
            errors: [expect.any(Error)],
          }),
        ],
      }),
    );

    expect(fail).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          message: `Exposing token ${SECRET_REPLACEMENT}`,
        }),
      }),
      {},
    );
  });

  it("should hide sensitive information passed to success step", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: first");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "feat: second");
    await pushBranch(cwd, url, "main");

    const env: Record<string, unknown> = { MY_TOKEN: "secret token" };

    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: cwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.minor);
    const generateNotes = vi
      .fn()
      .mockResolvedValue(`Exposing token ${env.MY_TOKEN as string}`);
    const publish = vi.fn().mockResolvedValue({
      name: `Exposing token ${env.MY_TOKEN as string}`,
      url: "https://release.com",
    });
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          plugins: [],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          generateNotes: [generateNotes],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual([
      expect.objectContaining({
        notes: `Exposing token ${SECRET_REPLACEMENT}`,
      }),
    ]);

    expect(success).toHaveBeenCalledWith(
      expect.objectContaining({
        nextRelease: expect.objectContaining({
          notes: `Exposing token ${SECRET_REPLACEMENT}`,
        }),
        releases: [
          expect.objectContaining({
            notes: `Exposing token ${SECRET_REPLACEMENT}`,
            artifacts: [
              expect.objectContaining({
                name: `Exposing token ${SECRET_REPLACEMENT}`,
              }),
            ],
          }),
        ],
      }),
      {},
    );
  });

  it("should get all commits including the ones not in the shallow clone", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "feat: first");
    await addTag(cwd, "v1.0.0");
    await writeFile(cwd, ["file1.txt"], "test");
    await addFiles(cwd);
    await commit(cwd, "feat: second");
    await writeFile(cwd, ["file2.txt"], "test");
    await addFiles(cwd);
    await commit(cwd, "feat: third");
    await writeFile(cwd, ["file3.txt"], "test");
    await addFiles(cwd);
    await commit(cwd, "feat: fourth");
    await pushBranch(cwd, url, "main");

    const shallowCwd = await cloneRepo(url, "main", 1);

    const env: Record<string, unknown> = { MY_TOKEN: "secret token" };

    const notes = "Release notes";
    const findPackages = vi
      .fn()
      .mockResolvedValue([{ path: shallowCwd, type: "npm", name: "main" }]);
    const verifyConditions = vi.fn();
    const analyzeCommits = vi.fn().mockResolvedValue(ReleaseType.major);
    const generateNotes = vi.fn().mockResolvedValue(notes);
    const publish = vi.fn();
    const success = vi.fn();
    const fail = vi.fn();

    const options = {
      packages: [
        {
          paths: ["./"],
          plugins: [],
          findPackages: [findPackages],
          verifyConditions: [verifyConditions],
          analyzeCommits: [analyzeCommits],
          generateNotes: [generateNotes],
          publish: [publish],
          success: [success],
          fail: [fail],
        },
      ],
    };

    const envCiResults = { branch: "main", isCi: true, isPr: false };
    vi.mocked(envCi).mockReturnValue(envCiResults as CiEnv);

    await expect(
      new LetsRelease().run(options, {
        cwd: shallowCwd,
        env,
        stdout: new WritableStreamBuffer(),
        stderr: new WritableStreamBuffer(),
      } as unknown as Context),
    ).resolves.toEqual([
      expect.objectContaining({
        version: "2.0.0",
      }),
    ]);

    expect(analyzeCommits).toHaveBeenCalledTimes(1);
    expect(analyzeCommits).toHaveBeenCalledWith(
      expect.objectContaining({
        commits: [
          expect.objectContaining({ message: "feat: fourth" }),
          expect.objectContaining({ message: "feat: third" }),
          expect.objectContaining({ message: "feat: second" }),
        ],
      }),
      {},
    );
  });
});
