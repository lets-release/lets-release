import { template } from "lodash-es";
import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { isValidCalVerBuildMetadata } from "src/helpers/isValidCalVerBuildMetadata";

/**
 * The calver build metadata to append to versions.
 *
 * A calver build metadata must comprise only ASCII alphanumerics hyphens,
 * and dashes: `[0-9A-Za-z-]`.
 *
 * The calver build metadata is generated using [Lodash template][] with
 * the variable `hash` set to the tag hash.
 *
 * [Lodash template]: https://lodash.com/docs#template
 */
export const CalVerBuildMetadata = NonEmptyString.superRefine((val, ctx) => {
  const value = template(val)({ hash: "a3478afc" });

  if (!isValidCalVerBuildMetadata(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message:
        "Build metadata must comprise only ASCII alphanumerics hyphens, and dashes: `[0-9A-Za-z-]`",
    });
  }
});

export type CalVerBuildMetadata = z.infer<typeof CalVerBuildMetadata>;
