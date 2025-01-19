import { isString } from "lodash-es";
import { z } from "zod";

import { loadModule } from "@lets-release/config";

import { CommitAnalyzerOptions } from "src/schemas/CommitAnalyzerOptions";
import { ReleaseRule } from "src/schemas/ReleaseRule";

export async function loadReleaseRules(
  options: CommitAnalyzerOptions,
  dirs?: string[],
  cwd: string = process.cwd(),
): Promise<ReleaseRule[] | undefined> {
  if (!options.releaseRules) {
    return;
  }

  return isString(options.releaseRules)
    ? await z
        .array(ReleaseRule)
        .min(1)
        .parseAsync(
          await loadModule<ReleaseRule[]>(options.releaseRules, dirs, cwd),
        )
    : options.releaseRules;
}
