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
export const TagFormat = NonEmptyString.superRefine(async (val, ctx) => {
  // Verify that compiling the `tagFormat` produce a valid Git tag
  if (
    !(await verifyGitTagName(
      template(val)({
        version: "0.0.0",
      }),
    ))
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tag format must compile to a [valid Git reference][]

[valid Git reference]: https://git-scm.com/docs/git-check-ref-format#_description`,
    });
  }

  // Verify the `tagFormat` contains the variable `version` by compiling the `tagFormat` template
  // with a space as the `version` value and verify the result contains the space.
  // The space is used as it's an invalid tag character, so it's guaranteed to no be present in the `tagFormat`.
  if (
    (
      template(val)({
        version: " ",
      }).match(/ /g) ?? []
    ).length !== 1
  ) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: `Tag format must contain the variable \`version\` exactly once`,
    });
  }
});

export type TagFormat = z.infer<typeof TagFormat>;
