import {
  BaseContext,
  LetsReleaseError,
  Package,
  extractErrors,
} from "@lets-release/config";

import { name } from "src/program";
import { parseMarkdown } from "src/utils/parseMarkdown";

export async function logErrors(
  { stderr, logger }: Pick<BaseContext, "stderr" | "logger">,
  error: unknown,
) {
  const errors = extractErrors(error).toSorted((a, b) => {
    if (a instanceof LetsReleaseError && b instanceof LetsReleaseError) {
      return 0;
    }

    if (!(a instanceof LetsReleaseError) && !(b instanceof LetsReleaseError)) {
      return 0;
    }

    if (a instanceof LetsReleaseError) {
      return -1;
    }

    return 1;
  });

  for (const e of errors) {
    const prefix =
      e && typeof e === "object" && "pkg" in e && e.pkg
        ? `[${(e.pkg as Package).uniqueName}]`
        : undefined;

    if (e instanceof LetsReleaseError) {
      logger.error({
        prefix,
        message: `${e.name}: ${e.message}`,
      });

      if (e.details) {
        stderr.write(await parseMarkdown(e.details));
      }
    } else {
      logger.error({
        prefix,
        message: [`An error occurred while running ${name}: %O`, e],
      });
    }
  }
}
