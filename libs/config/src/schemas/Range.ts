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
export const Range = NonEmptyString.check((ctx) => {
  if (!/^(\d+[._-])+(x[._-])?x$/i.test(ctx.value)) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: "Invalid range",
    });
  }
});

export type Range = z.infer<typeof Range>;
