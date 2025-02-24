import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { postProcessFindPackagesResults } from "src/utils/plugin/post-processors/postProcessFindPackagesResults";

describe("postProcessFindPackagesResults", () => {
  it("should post process find packages results", () => {
    expect(
      postProcessFindPackagesResults(
        {
          options: { mainPackage: "main" },
        } as NormalizedStepContext<Step.findPackages>,
        [
          [{ name: "main" }],
          [{ name: "test" }],
          undefined,
        ] as NormalizedStepResult<Step.findPackages>[],
      ),
    ).toEqual([{ name: "main" }, { name: "test" }]);
  });
});
