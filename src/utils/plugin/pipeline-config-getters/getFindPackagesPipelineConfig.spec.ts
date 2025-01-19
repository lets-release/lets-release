import { BaseContext } from "@lets-release/config";

import { getFindPackagesPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getFindPackagesPipelineConfig";
import { postProcessFindPackagesResults } from "src/utils/plugin/post-processors/postProcessFindPackagesResults";
import { packageInfosToPackages } from "src/utils/plugin/transformers/packageInfosToPackages";

describe("getFindPackagesPipelineConfig", () => {
  it("should return find packages pipeline config", () => {
    expect(
      getFindPackagesPipelineConfig({}, {} as BaseContext["logger"]),
    ).toEqual({
      settleAll: true,
      transform: packageInfosToPackages,
      postProcess: postProcessFindPackagesResults,
    });
  });
});
