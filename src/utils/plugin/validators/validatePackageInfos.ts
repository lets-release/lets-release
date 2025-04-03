import { stat } from "node:fs/promises";
import path from "node:path";

import { z } from "zod";

import { FindPackagesResult, Step } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { StepResultValidator } from "src/types/StepResultValidator";

export const validatePackageInfos: StepResultValidator<
  Step.findPackages
> = async ({ repositoryRoot }, pluginName, result) => {
  try {
    await FindPackagesResult.superRefine(async (val, ctx) => {
      if (!val) {
        return;
      }

      for (const pkg of val) {
        if (path.isAbsolute(pkg.path)) {
          try {
            const stats = await stat(pkg.path);

            if (!stats.isDirectory()) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Path is not a directory: ${pkg.path}`,
              });
            }

            if (/^\.\.[/\\]/.test(path.relative(repositoryRoot, pkg.path))) {
              ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: `Path is not inside the repository: ${pkg.path}`,
              });
            }
          } catch {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: `Path does not exist: ${pkg.path}`,
            });
          }
        } else {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
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
