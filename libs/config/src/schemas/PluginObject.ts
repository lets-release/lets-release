import { z } from "zod";

import { Step } from "src/enums/Step";
import { AnyFunction } from "src/schemas/AnyFunction";
import { StepFunction } from "src/types/StepFunction";

export const PluginObject = z
  .object({
    [Step.findPackages]: AnyFunction.optional(),
    [Step.verifyConditions]: AnyFunction.optional(),
    [Step.analyzeCommits]: AnyFunction.optional(),
    [Step.verifyRelease]: AnyFunction.optional(),
    [Step.generateNotes]: AnyFunction.optional(),
    [Step.addChannels]: AnyFunction.optional(),
    [Step.prepare]: AnyFunction.optional(),
    [Step.publish]: AnyFunction.optional(),
    [Step.success]: AnyFunction.optional(),
    [Step.fail]: AnyFunction.optional(),
  })
  .catchall(z.any());

/**
 * Plugin module object.
 */
export type PluginObject = {
  [S in Step]?: StepFunction<S>;
};
