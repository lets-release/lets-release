import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

/**
 * For [semantic versions][], the `range` must be formatted like `N.N.x`
 * or `N.x` (`N` is a number).
 *
 * For [calendar versions][], the `range` must be formatted like
 * `(\\d+[._-])+(x[._-])?x` and satisfied the package's `versioning.format`.
 *
 * [semantic versions]: https://semver.org/
 * [calendar versions]: https://calver.org/
 */
export const Range = NonEmptyString.superRefine((val, ctx) => {
  if (!/^(\d+[._-])+(x[._-])?x$/i.test(val)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Invalid range",
    });
  }
});

export type Range = z.infer<typeof Range>;
