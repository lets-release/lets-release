import { Step } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";

describe("InvalidStepResultError", () => {
  it("should be defined", () => {
    const error = new InvalidStepResultError(
      Step.findPackages,
      "@lets-release/npm",
      "Invalid step result",
      new Error("Invalid step result"),
    );

    expect(error.message).toBe(
      "The `findPackages` step returned an invalid value.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "The `findPackages` function of the `@lets-release/npm`",
      ),
    );
  });
});
