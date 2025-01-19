import { Step } from "@lets-release/config";

import { RELEASE_NOTES_SEPARATOR } from "src/constants/RELEASE_NOTES_SEPARATOR";
import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { postProcessGenerateNotesResults } from "src/utils/plugin/post-processors/postProcessGenerateNotesResults";

export const getGenerateNotesPipelineConfig: StepPipelineConfigGetter<
  Step.generateNotes
> = () => ({
  getNextContext: ({ nextRelease, ...context }, notes) => ({
    ...context,
    nextRelease: {
      ...nextRelease,
      notes: `${nextRelease.notes ? `${nextRelease.notes}${RELEASE_NOTES_SEPARATOR}` : ""}${notes ?? ""}`,
    },
  }),
  postProcess: postProcessGenerateNotesResults,
});
