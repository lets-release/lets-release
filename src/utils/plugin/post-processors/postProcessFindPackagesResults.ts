import { Step } from "@lets-release/config";

import { StepPipelinePostProcessor } from "src/types/StepPipelinePostProcessor";

export const postProcessFindPackagesResults: StepPipelinePostProcessor<
  Step.findPackages
> = ({ options: { mainPackage } }, results) =>
  results.flatMap(
    (result) =>
      result?.map(({ name, ...rest }) => ({
        ...rest,
        ...(mainPackage && name === mainPackage ? { main: true } : {}),
        name,
      })) ?? [],
  );
