import { template } from "lodash-es";
import { z } from "zod";

import { isValidPrereleaseName } from "src/helpers/isValidPrereleaseName";
import { NonEmptyString } from "src/schemas/NonEmptyString";

/**
 * The prerelease name to append to versions.
 *
 * A prerelease name must be valid according to the
 * [Semantic Versioning Specification][]. It determines the version names.
 * For example, if the name is set to `"beta"`, the versions will be formatted
 * like `2.0.0-beta.1`, `2.0.0-beta.2`, etc.
 *
 * The prerelease name is generated using [Lodash template][] with the
 * variable `name` set to the branch name for prerelease branches, and set to
 * key of `prereleases` option for maintenance or release branches.
 *
 * [Semantic Versioning Specification]: https://semver.org/#spec-item-9
 * [Lodash template]: https://lodash.com/docs#template
 */
export const PrereleaseName = NonEmptyString.check((ctx) => {
  const value = template(ctx.value)({ name: "beta" });

  if (value && !isValidPrereleaseName(value)) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Prerelease name must be be valid per the [Semantic Versioning Specification][]

[Semantic Versioning Specification]: https://semver.org/#spec-item-9`,
    });
  }
});

export type PrereleaseName = z.infer<typeof PrereleaseName>;
