import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { pipelineStepFunctions } from "src/utils/plugin/pipelineStepFunctions";

describe("pipelineStepFunctions", () => {
  it("should executes all functions in the pipeline", async () => {
    const func1 = vi.fn().mockResolvedValue("result1");
    const func2 = vi.fn().mockResolvedValue("result2");
    const funcs = [func1, func2] as unknown as NormalizedStepFunction[];
    const pipeline = pipelineStepFunctions(funcs);

    const context = {} as NormalizedStepContext<Step>;
    const result = await pipeline(context);

    expect(func1).toHaveBeenCalledWith(context);
    expect(func2).toHaveBeenCalledWith(context);
    expect(result).toEqual(["result1", "result2"]);
  });

  it("should handles errors correctly when settleAll is false", async () => {
    const func1 = vi.fn().mockResolvedValue("result1");
    const func2 = vi.fn().mockRejectedValue(new Error("error2"));
    const funcs = [func1, func2] as unknown as NormalizedStepFunction[];
    const pipeline = pipelineStepFunctions(funcs);

    const context = {} as NormalizedStepContext<Step>;

    await expect(pipeline(context)).rejects.toThrow("error2");
    expect(func1).toHaveBeenCalledWith(context);
    expect(func2).toHaveBeenCalledWith(context);
  });

  it("should collects errors when settleAll is true", async () => {
    const func1 = vi.fn().mockResolvedValue("result1");
    const func2 = vi.fn().mockRejectedValue(new Error("error2"));
    const funcs = [func1, func2] as unknown as NormalizedStepFunction[];
    const pipeline = pipelineStepFunctions(funcs, { settleAll: true });

    const context = {} as NormalizedStepContext<Step>;

    await expect(pipeline(context)).rejects.toThrow("AggregateError");
    expect(func1).toHaveBeenCalledWith(context);
    expect(func2).toHaveBeenCalledWith(context);
  });

  it("should calls preProcess and postProcess hooks", async () => {
    const func1 = vi.fn().mockResolvedValue("result1");
    const funcs = [func1] as unknown as NormalizedStepFunction[];
    const preProcess = vi.fn().mockResolvedValue("preProcessedContext");
    const postProcess = vi.fn().mockResolvedValue("postProcessedResult");
    const pipeline = pipelineStepFunctions(funcs, { preProcess, postProcess });

    const context = {} as NormalizedStepContext<Step>;
    const result = await pipeline(context);

    expect(preProcess).toHaveBeenCalledWith(context);
    expect(postProcess).toHaveBeenCalledWith("preProcessedContext", [
      "result1",
    ]);
    expect(result).toEqual("postProcessedResult");
  });

  it("should calls transform and getNextContext hooks", async () => {
    const func1 = vi.fn().mockResolvedValue("result1");
    const funcs = [func1] as unknown as NormalizedStepFunction[];
    const transform = vi.fn().mockResolvedValue("transformedResult");
    const getNextContext = vi.fn().mockResolvedValue("nextContext");
    const pipeline = pipelineStepFunctions(funcs, {
      transform,
      getNextContext,
    });

    const context = {} as NormalizedStepContext<Step>;
    const result = await pipeline(context);

    expect(func1).toHaveBeenCalledWith(context);
    expect(transform).toHaveBeenCalledWith(context, func1, "result1");
    expect(getNextContext).toHaveBeenCalledWith(context, "transformedResult");
    expect(result).toEqual(["transformedResult"]);
  });
});
