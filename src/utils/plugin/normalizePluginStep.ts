import { debug } from "debug";
import { cloneDeep, isString, omit } from "lodash-es";

import {
  BaseContext,
  PluginObject,
  PluginStepSpec,
  Step,
  StepContext,
  extractErrors,
  loadModule,
} from "@lets-release/config";

import { name } from "src/program";
import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { StepDefinition } from "src/types/StepDefinition";
import { denormalizeNextRelease } from "src/utils/plugin/denormalizeNextRelease";
import { parsePluginStepSpec } from "src/utils/plugin/parsePluginStepSpec";

export async function normalizePluginStep<T extends Step = Step>(
  {
    cwd,
    stdout,
    stderr,
    logger,
    repositoryRoot,
  }: Pick<
    BaseContext,
    "cwd" | "stdout" | "stderr" | "logger" | "repositoryRoot"
  >,
  step: T,
  spec: PluginStepSpec<T>,
  {
    dryRunnable,
    validate,
  }: Pick<StepDefinition<T>, "dryRunnable" | "validate">,
) {
  const [pluginStep, pluginStepOptions] = parsePluginStepSpec<T>(spec);

  const pluginName = isString(pluginStep)
    ? pluginStep
    : (pluginStep.pluginName ??
      `[Function: ${pluginStep.name || "(anonymous)"}]`);

  debug(`${name}:utils.plugin.normalizePluginStep`)(
    `options for ${pluginName}/${step}: %O`,
    pluginStepOptions,
  );

  const pluginObject = isString(pluginStep)
    ? await PluginObject.parseAsync(
        await loadModule(pluginStep, [repositoryRoot], cwd),
      )
    : { [step]: pluginStep };
  const func = pluginObject[step];

  if (!func) {
    return;
  }

  const normalizedFunc = async (
    normalizedContext: NormalizedStepContext<T>,
  ): Promise<NormalizedStepResult<T> | undefined> => {
    const scopedLogger = logger.scope(name, pluginName);
    const {
      package: pkg,
      currentRelease,
      nextRelease,
    } = normalizedContext as unknown as NormalizedStepContext<Step.addChannels> &
      NormalizedStepContext<Step.success>;
    const prefix = pkg ? `[${pkg.name}]` : undefined;

    try {
      const context = {
        ...cloneDeep(
          omit(normalizedContext, [
            "stdout",
            "stderr",
            "logger",
            "nextRelease",
            "getPluginContext",
            "setPluginContext",
            "getPluginPackageContext",
            "setPluginPackageContext",
          ]),
        ),
        stdout,
        stderr,
        logger: scopedLogger,
        nextRelease: denormalizeNextRelease(
          normalizedContext,
          pluginName,
          nextRelease,
          { updateBuild: !currentRelease },
        ),
        getPluginContext: <T>() =>
          normalizedContext.getPluginContext<T>(pluginName),
        setPluginContext: <T>(value: T) =>
          normalizedContext.setPluginContext<T>(pluginName, value),
        getPluginPackageContext: <T>() =>
          (pkg
            ? normalizedContext.getPluginPackageContext<T>(pluginName, pkg.name)
            : undefined) as T,
        setPluginPackageContext: <T>(value: T) =>
          pkg
            ? normalizedContext.setPluginPackageContext(
                pluginName,
                pkg.name,
                value,
              )
            : undefined,
      } as unknown as StepContext<T>;

      if (context.options.dryRun && !dryRunnable) {
        scopedLogger.warn({
          prefix,
          message: `Skip step ${step} in dry-run mode`,
        });

        return;
      }

      scopedLogger.log({
        prefix,
        message: `Start step ${step}`,
      });

      const result = await func(context, pluginStepOptions);

      await validate?.(context, pluginName, result);

      scopedLogger.success({
        prefix,
        message: `Completed step ${step}`,
      });

      return result as NormalizedStepResult<T>;
    } catch (error) {
      scopedLogger.error({
        prefix,
        message: `Failed step ${step}`,
      });

      for (const err of extractErrors(error)) {
        Object.assign(err, { pluginName });
      }

      throw error;
    }
  };

  Reflect.defineProperty(normalizedFunc, "pluginName", {
    value: pluginName,
    writable: false,
    enumerable: true,
  });

  logger.success(`Loaded step ${step} (${pluginName})`);

  return normalizedFunc as NormalizedStepFunction<T>;
}
