import { Step } from "@lets-release/config";

import { StepResultTransformer } from "src/types/StepResultTransformer";

export const packageInfosToPackages: StepResultTransformer<
  Step.findPackages
> = ({ packageOptions: { versioning } }, { pluginName }, packages) =>
  packages?.map((pkg) => ({
    ...pkg,
    versioning,
    pluginName,
  }));
