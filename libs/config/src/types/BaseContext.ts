import { CiEnv } from "env-ci";
import { Signale } from "signale";

import { NormalizedOptions } from "src/schemas/Options";
import { Context } from "src/types/Context";

/**
 * Base context used in every release step.
 */
export interface BaseContext extends Required<Context> {
  /**
   * Signale console logger instance.
   *
   * Has error, log and success methods.
   */
  logger: Signale<"log" | "warn" | "error" | "success">;

  /**
   * Information about the CI environment.
   */
  ciEnv: CiEnv;

  /**
   * The root directory of the repository.
   */
  repositoryRoot: string;

  /**
   * Let's Release Options.
   */
  options: NormalizedOptions;
}
