import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { postProcessReleaseResults } from "src/utils/plugin/post-processors/postProcessReleaseResults";

describe("postProcessReleaseResults", () => {
  it("should post process release results", () => {
    expect(
      postProcessReleaseResults(
        {} as NormalizedStepContext<Step.publish>,
        [
          { version: "1.0.0" },
          undefined,
        ] as NormalizedStepResult<Step.publish>[],
      ),
    ).toEqual([{ version: "1.0.0" }]);
  });
});
