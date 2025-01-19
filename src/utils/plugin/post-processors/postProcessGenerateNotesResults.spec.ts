import { Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { NormalizedStepResult } from "src/types/NormalizedStepResult";
import { postProcessGenerateNotesResults } from "src/utils/plugin/post-processors/postProcessGenerateNotesResults";

describe("postProcessGenerateNotesResults", () => {
  it("should post process generate notes results", () => {
    expect(
      postProcessGenerateNotesResults(
        { env: {} } as NormalizedStepContext<Step.generateNotes>,
        ["test", "test2"] as NormalizedStepResult<Step.generateNotes>[],
      ),
    ).toEqual("test\n\ntest2");
  });
});
