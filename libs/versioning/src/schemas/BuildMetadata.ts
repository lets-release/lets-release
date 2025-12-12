import { template } from "lodash-es";
import { z } from "zod";

import { isValidBuildMetadata } from "src/helpers/isValidBuildMetadata";
import { NonEmptyString } from "src/schemas/NonEmptyString";

/**
 * The build metadata to append to versions.
 *
 * A build metadata must be valid according to the
 * [Semantic Versioning Specification][]. It determines the version names.
 * For example, if the metadata is set to `"build"`, the versions will be
 * formatted like `2.0.0+build`.
 *
 * The build metadata is generated using [Lodash template][] with the
 * variable `hash` set to the tag hash.
 *
 * [Semantic Versioning Specification]: https://semver.org/#spec-item-10
 * [Lodash template]: https://lodash.com/docs#template
 */
export const BuildMetadata = NonEmptyString.check((ctx) => {
  const value = template(ctx.value)({ hash: "a3478afc" });

  if (!isValidBuildMetadata(value)) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Build metadata must be valid according to the [Semantic Versioning Specification][].

[Semantic Versioning Specification]: https://semver.org/#spec-item-10`,
    });
  }
});

export type BuildMetadata = z.infer<typeof BuildMetadata>;
