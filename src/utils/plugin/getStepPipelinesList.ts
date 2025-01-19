import { isString } from "lodash-es";

import {
  BaseContext,
  PluginObject,
  Step,
  StepFunction,
  loadModule,
} from "@lets-release/config";

import { InvalidPluginSpecError } from "src/errors/InvalidPluginSpecError";
import { StepPipelines } from "src/types/StepPipelines";
import { getStepPipeline } from "src/utils/plugin/getStepPipeline";
import { parsePluginSpec } from "src/utils/plugin/parsePluginSpec";

export async function getStepPipelinesList({
  cwd,
  stdout,
  stderr,
  logger,
  repositoryRoot,
  options: { packages },
}: Pick<
  BaseContext,
  "cwd" | "stdout" | "stderr" | "logger" | "repositoryRoot" | "options"
>): Promise<StepPipelines[]> {
  const errors: unknown[] = [];
  const steps = Object.values(Step);
  const list = await Promise.all(
    packages.map(async ({ plugins, ...rest }) => {
      const stepSpecs: {
        [S in Step]?: [StepFunction<S>, object][];
      } = {};

      for (const spec of plugins) {
        const [plugin, pluginOptions] = parsePluginSpec(spec);
        const pluginName = isString(plugin) ? plugin : "Inline plugin";

        try {
          const pluginObject = (await PluginObject.parseAsync(
            isString(plugin)
              ? await loadModule(plugin, [repositoryRoot], cwd)
              : plugin,
          )) as PluginObject;

          for (const step of steps) {
            if (!pluginObject[step]) {
              continue;
            }

            Reflect.defineProperty(pluginObject[step] as object, "pluginName", {
              value: pluginName,
              writable: false,
              enumerable: true,
            });

            stepSpecs[step] = [
              ...(stepSpecs[step] ?? []),
              [pluginObject[step], pluginOptions],
            ] as never;
          }
        } catch (error) {
          errors.push(new InvalidPluginSpecError(spec, error));
        }
      }

      const entries = await Promise.all(
        steps.map(async (step) => {
          try {
            return [
              step,
              await getStepPipeline<typeof step>(
                { cwd, stdout, stderr, logger, repositoryRoot },
                { ...stepSpecs, ...rest },
                step,
              ),
            ];
          } catch (error) {
            errors.push(error);
            return [];
          }
        }),
      );

      return Object.fromEntries(
        entries.filter((entry) => entry.length > 0),
      ) as StepPipelines;
    }),
  );

  if (errors.length > 0) {
    throw new AggregateError(errors, "AggregateError");
  }

  return list;
}
