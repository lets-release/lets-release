import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { postProcessFindPackagesResults } from "src/utils/plugin/post-processors/postProcessFindPackagesResults";
import { packageInfosToPackages } from "src/utils/plugin/transformers/packageInfosToPackages";

export const getFindPackagesPipelineConfig: StepPipelineConfigGetter<
  Step.findPackages
> = () => ({
  settleAll: true,
  transform: packageInfosToPackages,
  postProcess: postProcessFindPackagesResults,
});
