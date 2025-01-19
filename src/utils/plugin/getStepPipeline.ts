import { BaseContext, PluginStepSpec, Step } from "@lets-release/config";

import { NoPluginStepSpecsError } from "src/errors/NoPluginStepSpecsError";
import { name } from "src/program";
import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { StepDefinitions } from "src/types/StepDefinitions";
import { StepPipeline } from "src/types/StepPipeline";
import { StepPipelines } from "src/types/StepPipelines";
import { normalizePluginStep } from "src/utils/plugin/normalizePluginStep";
import { getAnalyzeCommitsPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getAnalyzeCommitsPipelineConfig";
import { getFailPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getFailPipelineConfig";
import { getFindPackagesPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getFindPackagesPipelineConfig";
import { getGenerateNotesPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getGenerateNotesPipelineConfig";
import { getPreparePipelineConfig } from "src/utils/plugin/pipeline-config-getters/getPreparePipelineConfig";
import { getReleasePipelineConfig } from "src/utils/plugin/pipeline-config-getters/getReleasePipelineConfig";
import { getSuccessPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getSuccessPipelineConfig";
import { getVerifyConditionsPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getVerifyConditionsPipelineConfig";
import { getVerifyReleasePipelineConfig } from "src/utils/plugin/pipeline-config-getters/getVerifyReleasePipelineConfig";
import { pipelineStepFunctions } from "src/utils/plugin/pipelineStepFunctions";
import { validateArtifactInfo } from "src/utils/plugin/validators/validateArtifactInfo";
import { validateNotes } from "src/utils/plugin/validators/validateNotes";
import { validatePackageInfos } from "src/utils/plugin/validators/validatePackageInfos";
import { validateReleaseType } from "src/utils/plugin/validators/validateReleaseType";

const stepDefinitions: StepDefinitions = {
  [Step.findPackages]: {
    required: true,
    dryRunnable: true,
    defaultSpecs: [`@${name}/npm`],
    validate: validatePackageInfos,
    getPipelineConfig: getFindPackagesPipelineConfig,
  },
  [Step.verifyConditions]: {
    dryRunnable: true,
    getPipelineConfig: getVerifyConditionsPipelineConfig,
  },
  [Step.analyzeCommits]: {
    required: true,
    dryRunnable: true,
    defaultSpecs: [`@${name}/commit-analyzer`],
    validate: validateReleaseType,
    getPipelineConfig: getAnalyzeCommitsPipelineConfig,
  },
  [Step.verifyRelease]: {
    dryRunnable: true,
    getPipelineConfig: getVerifyReleasePipelineConfig,
  },
  [Step.generateNotes]: {
    dryRunnable: true,
    validate: validateNotes,
    getPipelineConfig: getGenerateNotesPipelineConfig,
  },
  [Step.addChannels]: {
    validate: validateArtifactInfo,
    getPipelineConfig: getReleasePipelineConfig,
  },
  [Step.prepare]: {
    getPipelineConfig: getPreparePipelineConfig,
  },
  [Step.publish]: {
    validate: validateArtifactInfo,
    getPipelineConfig: getReleasePipelineConfig,
  },
  [Step.success]: {
    getPipelineConfig: getSuccessPipelineConfig,
  },
  [Step.fail]: {
    getPipelineConfig: getFailPipelineConfig,
  },
};

export async function getStepPipeline<T extends Step = Step>(
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
  options: {
    [S in Step]?: PluginStepSpec<S>[];
  },
  step: T,
): Promise<StepPipeline<T> | undefined> {
  const { required, dryRunnable, defaultSpecs, validate, getPipelineConfig } =
    stepDefinitions[step];

  const specs = options[step] ?? defaultSpecs;

  if (!specs?.length) {
    if (required) {
      throw new NoPluginStepSpecsError(step);
    } else {
      return;
    }
  }

  const funcs = await Promise.all(
    specs.map(
      async (spec) =>
        await normalizePluginStep<typeof step>(
          { cwd, stdout, stderr, logger, repositoryRoot },
          step,
          spec,
          { dryRunnable, validate },
        ),
    ),
  );

  return async (
    stepPipelines: StepPipelines,
    context: NormalizedStepContext<T>,
  ) =>
    await pipelineStepFunctions<T>(
      funcs.filter(Boolean) as NormalizedStepFunction<T>[],
      getPipelineConfig?.(stepPipelines, logger),
    )(context);
}
