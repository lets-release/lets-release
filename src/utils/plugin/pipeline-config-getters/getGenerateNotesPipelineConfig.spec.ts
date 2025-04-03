/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BaseContext, Step } from "@lets-release/config";

import { NormalizedStepContext } from "src/types/NormalizedStepContext";
import { getGenerateNotesPipelineConfig } from "src/utils/plugin/pipeline-config-getters/getGenerateNotesPipelineConfig";
import { postProcessGenerateNotesResults } from "src/utils/plugin/post-processors/postProcessGenerateNotesResults";

describe("getGenerateNotesPipelineConfig", () => {
  it("should return generate notes pipeline config", () => {
    const config = getGenerateNotesPipelineConfig(
      {},
      {} as BaseContext["logger"],
    );

    expect(config).toEqual({
      getNextContext: expect.any(Function),
      postProcess: postProcessGenerateNotesResults,
    });

    expect(
      config.getNextContext!({
        nextRelease: {
          notes: "notes",
        },
      } as NormalizedStepContext<Step.generateNotes>),
    ).toEqual({
      nextRelease: {
        notes: "notes\n\n",
      },
    });

    expect(
      config.getNextContext!(
        {
          nextRelease: {},
        } as NormalizedStepContext<Step.generateNotes>,
        "new notes",
      ),
    ).toEqual({
      nextRelease: {
        notes: "new notes",
      },
    });
  });
});
