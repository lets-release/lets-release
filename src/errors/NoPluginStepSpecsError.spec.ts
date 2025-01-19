import { Step } from "@lets-release/config";

import { NoPluginStepSpecsError } from "src/errors/NoPluginStepSpecsError";

describe("NoPluginStepSpecsError", () => {
  it("should be defined", () => {
    const error = new NoPluginStepSpecsError(Step.findPackages);

    expect(error.message).toBe(
      "The `findPackages` step configuration is required.",
    );
    expect(error.details).toEqual(
      "The `findPackages` step configuration is required.",
    );
  });
});
