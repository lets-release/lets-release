import {
  BaseContext,
  PluginObject,
  Step,
  loadModule,
} from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getStepPipeline } from "src/utils/plugin/getStepPipeline";
import { getStepPipelinesList } from "src/utils/plugin/getStepPipelinesList";

vi.mock("@lets-release/config");
vi.mock("src/utils/logErrors");
vi.mock("src/utils/plugin/getStepPipeline");

const parseAsync = vi.spyOn(PluginObject, "parseAsync");

describe("getStepPipelinesList", () => {
  const context = {
    cwd: "/path/to/repo",
    stdout: process.stdout,
    stderr: process.stderr,
    repositoryRoot: "/path/to/repo",
    options: {
      packages: [
        {
          plugins: ["plugin1", ["plugin2", { a: "b" }], {}],
        },
      ],
    },
  } as unknown as Pick<
    BaseContext,
    "cwd" | "stdout" | "stderr" | "logger" | "repositoryRoot" | "options"
  >;

  beforeEach(() => {
    vi.mocked(loadModule).mockReset().mockResolvedValue({});
    vi.mocked(getStepPipeline)
      .mockReset()
      .mockResolvedValue(vi.fn().mockResolvedValue(undefined));
    parseAsync.mockReset().mockResolvedValue({});
  });

  it("should throw AggregateError if there are errors", async () => {
    vi.mocked(loadModule).mockImplementation(() => {
      throw new Error("Failed to load module");
    });
    vi.mocked(getStepPipeline).mockImplementation(() => {
      throw new Error("Failed to get step pipeline");
    });

    await expect(getStepPipelinesList(context)).rejects.toThrow(AggregateError);
  });

  it("should return step pipelines list", async () => {
    parseAsync
      .mockResolvedValueOnce({})
      .mockResolvedValue({ prepare: vi.fn() });

    const stepPipelinesList = await getStepPipelinesList(context);

    expect(stepPipelinesList).toBeInstanceOf(Array);
    expect(stepPipelinesList.length).toBe(1);

    await expect(
      stepPipelinesList[0].prepare?.(
        stepPipelinesList[0],
        {} as NormalizedStepContext<Step.prepare>,
      ),
    ).resolves.toBeUndefined();
  });

  it("should handle errors in step pipelines list", async () => {
    vi.mocked(getStepPipeline)
      .mockReset()
      // eslint-disable-next-line @typescript-eslint/require-await
      .mockImplementation(async (_1, _2, step) => {
        if (step === Step.findPackages) {
          return vi
            .fn()
            .mockRejectedValue(new Error("Failed to run step pipeline"));
        }

        return vi.fn();
      });

    const stepPipelinesList = await getStepPipelinesList(context);

    await expect(
      stepPipelinesList[0].findPackages?.(
        stepPipelinesList[0],
        {} as NormalizedStepContext<Step.findPackages>,
      ),
    ).rejects.toThrow(Error);
  });
});
