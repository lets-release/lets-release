import { template } from "lodash-es";
import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { isValidSemVerPrereleaseName } from "src/helpers/isValidSemVerPrereleaseName";

/**
 * The semver pre-release name to append to versions.
 *
 * A semver pre-release name must be valid according to the
 * [Semantic Versioning Specification][]. It determines the version names.
 * For example, if the name is set to `"beta"`, the versions will be formatted
 * like `2.0.0-beta.1`, `2.0.0-beta.2`, etc.
 *
 * The semver pre-release name is generated using [Lodash template][] with the
 * variable `name` set to the branch name for prerelease branches, and set to
 * key of `prereleases` option for maintenance or release branches.
 *
 * [Semantic Versioning Specification]: https://semver.org/#spec-item-9
 * [Lodash template]: https://lodash.com/docs#template
 */
export const SemVerPrereleaseName = NonEmptyString.superRefine((val, ctx) => {
  const value = template(val)({ name: "beta" });

  if (value && !isValidSemVerPrereleaseName(value)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `SemVer Prerelease name must be be valid per the [Semantic Versioning Specification][]

[Semantic Versioning Specification]: https://semver.org/#spec-item-9`,
    });
  }
});

export type SemVerPrereleaseName = z.infer<typeof SemVerPrereleaseName>;
