import { BaseContext, Step } from "@lets-release/config";

import { NoPluginStepSpecsError } from "src/errors/NoPluginStepSpecsError";
import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getStepPipeline } from "src/utils/plugin/getStepPipeline";
import { normalizePluginStep } from "src/utils/plugin/normalizePluginStep";
import { pipelineStepFunctions } from "src/utils/plugin/pipelineStepFunctions";

vi.mock("src/utils/plugin/normalizePluginStep");
vi.mock("src/utils/plugin/pipelineStepFunctions");

const fn = vi.fn();

vi.mocked(pipelineStepFunctions).mockReturnValue(fn);

describe("getStepPipeline", () => {
  const context = {
    cwd: "/path/to/repo",
    stdout: process.stdout,
    stderr: process.stderr,
    repositoryRoot: "/path/to/repo",
  } as unknown as Pick<
    BaseContext,
    "cwd" | "stdout" | "stderr" | "logger" | "repositoryRoot"
  >;

  beforeEach(() => {
    vi.mocked(normalizePluginStep).mockClear();
    vi.mocked(pipelineStepFunctions).mockClear();
  });

  it("should throw NoPluginStepSpecsError if required step has no specs", async () => {
    await expect(
      getStepPipeline(
        context,
        {
          [Step.findPackages]: [],
        },
        Step.findPackages,
      ),
    ).rejects.toThrow(NoPluginStepSpecsError);
  });

  it("should return undefined if non-required step has no specs", async () => {
    await expect(
      getStepPipeline(context, {}, Step.verifyConditions),
    ).resolves.toBeUndefined();
  });

  it("should call normalizePluginStep for each spec", async () => {
    await expect(
      getStepPipeline(
        context,
        {
          [Step.analyzeCommits]: ["spec1", "spec2"],
        },
        Step.analyzeCommits,
      ),
    ).resolves.toBeInstanceOf(Function);
    expect(normalizePluginStep).toHaveBeenCalledTimes(2);
  });

  it("should return a function that calls pipelineStepFunctions", async () => {
    const pipeline = await getStepPipeline(
      context,
      {
        [Step.analyzeCommits]: ["spec1"],
      },
      Step.analyzeCommits,
    );

    expect(pipeline).toBeInstanceOf(Function);

    const stepPipelines = {};
    const stepContext = {};

    await pipeline?.(
      stepPipelines,
      stepContext as NormalizedStepContext<Step.analyzeCommits>,
    );

    expect(pipelineStepFunctions).toHaveBeenCalledOnce();
    expect(fn).toHaveBeenCalledWith(stepContext);
  });
});
