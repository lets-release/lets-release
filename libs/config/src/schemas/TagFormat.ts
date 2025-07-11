import { template } from "lodash-es";
import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { verifyGitTagName } from "src/helpers/verifyGitTagName";

/**
 * Version tag format.
 *
 * Don't use any other variables in `tagFormat`, cause it will be use to find
 * historical version tags in the repository.
 */
export const TagFormat = NonEmptyString.check(async (ctx) => {
  // Verify that compiling the `tagFormat` produce a valid Git tag
  if (
    !(await verifyGitTagName(
      template(ctx.value)({
        version: "0.0.0",
      }),
    ))
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Tag format must compile to a [valid Git reference][]

[valid Git reference]: https://git-scm.com/docs/git-check-ref-format#_description`,
    });
  }

  // Verify the `tagFormat` contains the variable `version` by compiling the `tagFormat` template
  // with a space as the `version` value and verify the result contains the space.
  // The space is used as it's an invalid tag character, so it's guaranteed to no be present in the `tagFormat`.
  if (
    (
      template(ctx.value)({
        version: " ",
      }).match(/ /g) ?? []
    ).length !== 1
  ) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Tag format must contain the variable \`version\` exactly once`,
    });
  }
});

export type TagFormat = z.infer<typeof TagFormat>;
