import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { preProcessSuccessContext } from "src/utils/plugin/pre-processors/preProcessSuccessContext";

describe("preProcessSuccessContext", () => {
  it("should pre process success context", () => {
    expect(
      preProcessSuccessContext({
        releases: [{ version: "1.0.0" }],
        env: {},
      } as NormalizedStepContext<Step.success>),
    ).toEqual({
      releases: [{ version: "1.0.0" }],
      env: {},
    });
  });
});
