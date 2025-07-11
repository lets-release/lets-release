import { template } from "lodash-es";
import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { isValidSemVerBuildMetadata } from "src/helpers/isValidSemVerBuildMetadata";

/**
 * The semver build metadata to append to versions.
 *
 * A semver build metadata must be valid according to the
 * [Semantic Versioning Specification][]. It determines the version names.
 * For example, if the metadata is set to `"build"`, the versions will be
 * formatted like `2.0.0+build`.
 *
 * The semver build metadata is generated using [Lodash template][] with the
 * variable `hash` set to the tag hash.
 *
 * [Semantic Versioning Specification]: https://semver.org/#spec-item-10
 * [Lodash template]: https://lodash.com/docs#template
 */
export const SemVerBuildMetadata = NonEmptyString.check((ctx) => {
  const value = template(ctx.value)({ hash: "a3478afc" });

  if (!isValidSemVerBuildMetadata(value)) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Build metadata must be valid according to the [Semantic Versioning Specification][].

[Semantic Versioning Specification]: https://semver.org/#spec-item-10`,
    });
  }
});

export type SemVerBuildMetadata = z.infer<typeof SemVerBuildMetadata>;
