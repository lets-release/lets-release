import { Step, StepContext } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { validateNotes } from "src/utils/plugin/validators/validateNotes";

describe("validateNotes", () => {
  it("should validate notes", async () => {
    await expect(
      validateNotes({} as StepContext<Step.generateNotes>, "test", "test"),
    ).resolves.toBeUndefined();
    await expect(
      validateNotes({} as StepContext<Step.generateNotes>, "test", ""),
    ).resolves.toBeUndefined();
    await expect(
      validateNotes({} as StepContext<Step.generateNotes>, "test", undefined),
    ).resolves.toBeUndefined();
    await expect(
      validateNotes({} as StepContext<Step.generateNotes>, "test", false),
    ).rejects.toThrow(InvalidStepResultError);
  });
});
