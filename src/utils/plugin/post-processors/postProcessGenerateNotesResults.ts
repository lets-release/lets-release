import { Step } from "@lets-release/config";

import { RELEASE_NOTES_SEPARATOR } from "src/constants/RELEASE_NOTES_SEPARATOR";
import { StepPipelinePostProcessor } from "src/types/StepPipelinePostProcessor";
import { getMaskingHandler } from "src/utils/getMaskingHandler";

export const postProcessGenerateNotesResults: StepPipelinePostProcessor<
  Step.generateNotes
> = ({ env }, results) =>
  getMaskingHandler(env)(results.filter(Boolean).join(RELEASE_NOTES_SEPARATOR));
