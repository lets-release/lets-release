import { Step, StepResult } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepFunction } from "src/types/NormalizedStepFunction";
import { packageInfosToPackages } from "src/utils/plugin/transformers/packageInfosToPackages";

describe("packageInfosToPackages", () => {
  it("should transform package infos to packages", () => {
    expect(
      packageInfosToPackages(
        {
          packageOptions: { versioning: "semver" },
        } as unknown as NormalizedStepContext<Step.findPackages>,
        { pluginName: "test" } as NormalizedStepFunction<Step.findPackages>,
        [{ name: "main" }, { name: "test" }] as StepResult<Step.findPackages>,
      ),
    ).toEqual([
      { name: "main", versioning: "semver", pluginName: "test" },
      { name: "test", versioning: "semver", pluginName: "test" },
    ]);
  });
});
