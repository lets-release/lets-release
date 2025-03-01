import { WritableStreamBuffer } from "stream-buffers";
import { temporaryDirectory } from "tempy";

import { BaseContext, Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getStepPipelinesList } from "src/utils/plugin/getStepPipelinesList";

const stdout = new WritableStreamBuffer();
const stderr = new WritableStreamBuffer();
const log = vi.fn();
const warn = vi.fn();
const success = vi.fn();
const error = vi.fn();
const scope = vi.fn();
const logger = { log, warn, success, error, scope };
const packageOptions = {
  paths: ["./"],
  versioning: {
    scheme: "SemVer",
    initialVersion: "1.0.0",
    prerelease: {
      initialNumber: 1,
      ignoreZeroNumber: true,
      prefix: "-",
      suffix: ".",
    },
  },
};
const options = {
  tagFormat: "v${version}",
  refSeparator: "/",
  branches: {
    main: "(main|master)",
    next: "next",
    nextMajor: "next-major",
    maintenance: ["+([0-9])?(.{+([0-9]),x}).x", "+(+([0-9])[._-])?(x[._-])x"],
    prerelease: ["alpha", "beta", "rc"],
  },
};

scope.mockReturnValue(logger);

describe("getStepPipelinesList", () => {
  it("should get step pipelines list with default config", async () => {
    const cwd = temporaryDirectory();
    const stepPipelinesList = await getStepPipelinesList({
      cwd,
      stdout,
      stderr,
      logger,
      repositoryRoot: cwd,
      options: {
        ...options,
        packages: [
          {
            ...packageOptions,
            plugins: [
              "@lets-release/commit-analyzer",
              "@lets-release/release-notes-generator",
              "@lets-release/npm",
              "@lets-release/github",
            ],
          },
        ],
      },
    } as unknown as BaseContext);

    expect(stepPipelinesList).toEqual([
      Object.fromEntries(
        Object.values(Step).flatMap((step) => {
          if ([Step.verifyRelease, Step.fail].includes(step)) {
            return [];
          }

          return [[step, expect.any(Function)]];
        }),
      ),
    ]);
  });

  it("should get step pipelines list with custom config", async () => {
    const cwd = temporaryDirectory();
    const findPackages = vi.fn().mockResolvedValue(undefined);
    const verifyConditions = vi.fn();
    const normalizedPackageOptions = {
      ...packageOptions,
      plugins: [
        "@lets-release/commit-analyzer",
        "@lets-release/release-notes-generator",
        {
          findPackages,
        },
      ],
      verifyConditions: [verifyConditions],
    };
    const context = {
      cwd,
      stdout,
      stderr,
      logger,
      repositoryRoot: cwd,
      options: {
        ...options,
        packages: [normalizedPackageOptions],
      },
    };

    const stepPipelinesList = await getStepPipelinesList(
      context as unknown as BaseContext,
    );

    expect(stepPipelinesList).toEqual([
      Object.fromEntries(
        Object.values(Step)
          .filter((step) =>
            [
              Step.findPackages,
              Step.verifyConditions,
              Step.analyzeCommits,
              Step.generateNotes,
            ].includes(step),
          )
          .map((step) => [step, expect.any(Function)]),
      ),
    ]);

    const stepPipelines = stepPipelinesList[0];

    await stepPipelines[Step.findPackages]?.(stepPipelines, {
      ...context,
      packageOptions: normalizedPackageOptions,
    } as unknown as NormalizedStepContext<Step.findPackages>);

    expect(findPackages).toBeCalledTimes(1);

    await stepPipelines[Step.verifyConditions]?.(stepPipelines, {
      ...context,
      packageOptions: normalizedPackageOptions,
      packages: [],
    } as unknown as NormalizedStepContext<Step.verifyConditions>);

    expect(verifyConditions).toBeCalledTimes(1);
  });
});
