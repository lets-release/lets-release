import { stat } from "node:fs/promises";
import path from "node:path";

import { FindPackagesResult, Step } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { StepResultValidator } from "src/types/StepResultValidator";

export const validatePackageInfos: StepResultValidator<
  Step.findPackages
> = async ({ repositoryRoot }, pluginName, result) => {
  try {
    await FindPackagesResult.check(async (ctx) => {
      if (!ctx.value) {
        return;
      }

      for (const pkg of ctx.value) {
        if (path.isAbsolute(pkg.path)) {
          try {
            const stats = await stat(pkg.path);

            if (!stats.isDirectory()) {
              ctx.issues.push({
                input: ctx.value,
                code: "custom",
                message: `Path is not a directory: ${pkg.path}`,
              });
            }

            if (/^\.\.[/\\]/.test(path.relative(repositoryRoot, pkg.path))) {
              ctx.issues.push({
                input: ctx.value,
                code: "custom",
                message: `Path is not inside the repository: ${pkg.path}`,
              });
            }
          } catch {
            ctx.issues.push({
              input: ctx.value,
              code: "custom",
              message: `Path does not exist: ${pkg.path}`,
            });
          }
        } else {
          ctx.issues.push({
            input: ctx.value,
            code: "custom",
            message: `Path is not absolute: ${pkg.path}`,
          });
        }
      }
    }).parseAsync(result);
  } catch (error) {
    throw new InvalidStepResultError(
      Step.findPackages,
      pluginName,
      result,
      error,
    );
  }
};
