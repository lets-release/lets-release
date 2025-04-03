/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  BaseContext,
  PluginObject,
  Step,
  extractErrors,
  loadModule,
} from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { StepDefinition } from "src/types/StepDefinition";
import { normalizePluginStep } from "src/utils/plugin/normalizePluginStep";

vi.mock("@lets-release/config");
vi.mock("src/utils/plugin/denormalizeHistoricalRelease");

const logger = {
  scope: vi.fn(),
  warn: vi.fn(),
  log: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
};
const baseContext = {
  cwd: "/path/to/cwd",
  stdout: process.stdout,
  stderr: process.stderr,
  logger,
  repositoryRoot: "/path/to/repo",
} as unknown as Pick<
  BaseContext,
  "cwd" | "stdout" | "stderr" | "logger" | "repositoryRoot"
>;
const step: Step = Step.analyzeCommits;
const plugin = "plugin-name";
const stepFunc = vi.fn();
const validate = vi.fn();
const stepDefinition: Pick<StepDefinition<Step>, "dryRunnable" | "validate"> = {
  dryRunnable: true,
  validate,
};
const parseAsync = vi.spyOn(PluginObject, "parseAsync");
const getPluginContext = vi.fn();
const setPluginContext = vi.fn();
const getPluginPackageContext = vi.fn();
const setPluginPackageContext = vi.fn();

logger.scope.mockReturnValue(logger);

describe("normalizePluginStep", () => {
  beforeEach(() => {
    vi.mocked(loadModule)
      .mockReset()
      .mockResolvedValue({
        [step]: stepFunc,
      });
    vi.mocked(extractErrors)
      .mockReset()
      .mockImplementation((e) => [e]);
    parseAsync.mockReset().mockResolvedValue({
      [step]: stepFunc,
    });
    logger.scope.mockClear();
    logger.warn.mockClear();
    logger.log.mockClear();
    logger.success.mockClear();
    logger.error.mockClear();
    stepFunc.mockReset();
    validate.mockReset();
  });

  it("should return undefined if no plugin step provided", async () => {
    vi.mocked(loadModule).mockResolvedValue({});
    parseAsync.mockResolvedValue({});

    const func = await normalizePluginStep(
      baseContext,
      step,
      plugin,
      stepDefinition,
    );

    expect(func).toBeUndefined();
  });

  it("should return normalized function with module name as plugin name", async () => {
    const func = await normalizePluginStep(
      baseContext,
      step,
      plugin,
      stepDefinition,
    );

    expect(func?.pluginName).toBe(plugin);
  });

  it("should return normalized function with function name as plugin name", async () => {
    const func = await normalizePluginStep(
      baseContext,
      step,
      stepFunc,
      stepDefinition,
    );

    expect(func?.pluginName).toBe(`[Function: ${stepFunc.name}]`);
  });

  it("should return normalized function with anonymous function name as plugin name", async () => {
    Reflect.defineProperty(stepFunc, "name", {
      value: "",
      writable: false,
      enumerable: true,
    });

    const func = await normalizePluginStep(
      baseContext,
      step,
      () => {
        // do nothing
      },
      stepDefinition,
    );

    expect(func?.pluginName).toBe(`[Function: (anonymous)]`);
  });

  it("should skip step in dry-run mode if not dryRunnable", async () => {
    const func = await normalizePluginStep(baseContext, step, stepFunc, {
      ...stepDefinition,
      dryRunnable: false,
    });

    await expect(
      func?.({
        ...baseContext,
        options: { dryRun: true },
        getPluginContext,
        setPluginContext,
        getPluginPackageContext,
        setPluginPackageContext,
      } as unknown as NormalizedStepContext<Step.analyzeCommits>),
    ).resolves.toBeUndefined();
  });

  it("should run step and validate result", async () => {
    const result = "test-result";
    stepFunc.mockResolvedValue(result);
    validate.mockImplementation((ctx) => {
      ctx.getPluginContext();
      ctx.setPluginContext();
      ctx.getPluginPackageContext();
      ctx.setPluginPackageContext();
    });

    const func = await normalizePluginStep(
      baseContext,
      step,
      stepFunc,
      stepDefinition,
    );

    await expect(
      func?.({
        ...baseContext,
        options: { dryRun: true },
        package: { name: "package" },
        releases: [{}],
        getPluginContext,
        setPluginContext,
        getPluginPackageContext,
        setPluginPackageContext,
      } as unknown as NormalizedStepContext<Step.analyzeCommits>),
    ).resolves.toBe(result);

    // without packages in context
    await expect(
      func?.({
        ...baseContext,
        options: { dryRun: true },
        getPluginContext,
        setPluginContext,
        getPluginPackageContext,
        setPluginPackageContext,
      } as unknown as NormalizedStepContext<Step.analyzeCommits>),
    ).resolves.toBe(result);
  });

  it("should throw error if failed to run step", async () => {
    const result = "test-result";
    stepFunc.mockResolvedValue(result);
    validate.mockImplementation((ctx) => {
      ctx.getPluginContext();
      ctx.setPluginContext();
      ctx.getPluginPackageContext();
      ctx.setPluginPackageContext();
      throw new Error("Failed to validate");
    });

    const func = await normalizePluginStep(
      baseContext,
      step,
      stepFunc,
      stepDefinition,
    );

    await expect(
      func?.({
        ...baseContext,
        options: { dryRun: true },
        package: { name: "package" },
        getPluginContext,
        setPluginContext,
        getPluginPackageContext,
        setPluginPackageContext,
      } as unknown as NormalizedStepContext<Step.analyzeCommits>),
    ).rejects.toThrow();
  });
});
