import { template } from "lodash-es";
import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { isValidCalVerPrereleaseName } from "src/helpers/isValidCalVerPrereleaseName";

/**
 * The calver pre-release name to append to versions.
 *
 * A calver pre-release name must comprise only ASCII alphanumerics hyphens,
 * and dashes: `[0-9A-Za-z-]`.
 *
 * A calver pre-release name must not start with a digit or a dot.
 *
 * The calver pre-release name is generated using [Lodash template][] with
 * the variable `name` set to the branch name for prerelease branches, and
 * set to key of `prereleases` option for maintenance or release branches.
 *
 * [Lodash template]: https://lodash.com/docs#template
 */
export const CalVerPrereleaseName = NonEmptyString.check((ctx) => {
  const value = template(ctx.value)({ name: "beta" });

  if (value && !isValidCalVerPrereleaseName(value)) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message:
        "CalVer Prerelease name must comprise only ASCII alphanumerics hyphens, and dashes: `[0-9A-Za-z-]`",
    });
  }
});

export type CalVerPrereleaseName = z.infer<typeof CalVerPrereleaseName>;
