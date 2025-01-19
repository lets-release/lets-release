import { Step } from "@lets-release/config";

import { StepPipelineConfigGetter } from "src/types/StepPipelineConfigGetter";
import { getHeadHash } from "src/utils/git/getHeadHash";

export const getPreparePipelineConfig: StepPipelineConfigGetter<
  Step.prepare
> = (stepPipelines) => ({
  getNextContext: async (context) => {
    const hash = await getHeadHash({ cwd: context.repositoryRoot });

    // If previous prepare plugin has created a commit (git head changed)
    if (hash && context.nextRelease.hash !== hash) {
      return {
        ...context,
        nextRelease: {
          ...context.nextRelease,
          hash,
          notes:
            // Regenerate the release notes
            (await stepPipelines.generateNotes?.(stepPipelines, {
              ...context,
              nextRelease: {
                ...context.nextRelease,
                hash,
              },
            })) ?? context.nextRelease.notes,
        },
      };
    }

    return context;
  },
});
