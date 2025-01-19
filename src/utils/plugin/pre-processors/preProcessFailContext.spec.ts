import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { preProcessFailContext } from "src/utils/plugin/pre-processors/preProcessFailContext";

describe("preProcessFailContext", () => {
  it("should pre process fail context", () => {
    expect(
      preProcessFailContext({
        error: { message: "test" },
        env: {},
      } as NormalizedStepContext<Step.fail>),
    ).toEqual({
      error: { message: "test" },
      env: {},
    });
  });
});
