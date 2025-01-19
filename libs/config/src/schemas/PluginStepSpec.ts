import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { Step } from "src/enums/Step";
import { AnyFunction } from "src/schemas/AnyFunction";
import { StepFunction } from "src/types/StepFunction";

export const PluginStepSpec = z.union([
  NonEmptyString,
  AnyFunction,
  z.tuple([
    z.union([NonEmptyString, AnyFunction]),
    z.object({}).passthrough().optional(),
  ]),
]);

/**
 * Plugin step specification.
 */
export type PluginStepSpec<T extends Step = Step, U extends object = object> =
  | string
  | StepFunction<T, U>
  | [string | StepFunction<T, U>, U?];
