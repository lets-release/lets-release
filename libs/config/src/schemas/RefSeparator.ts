import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { verifyGitBranchName } from "src/helpers/verifyGitBranchName";
import { verifyGitTagName } from "src/helpers/verifyGitTagName";

/**
 * Git ref separator.
 */
export const RefSeparator = NonEmptyString.check(async (ctx) => {
  // Verify that the `refSeparator` is a valid git reference character
  const isValidBranchNameChar = await verifyGitBranchName(
    `lets-release${ctx.value}0.0.x`,
  );
  const isValidTagNameChar = await verifyGitTagName(
    `lets-release${ctx.value}v0.0.0`,
  );

  if (!isValidBranchNameChar || !isValidTagNameChar) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Ref separator must only contain [valid Git reference][] characters

[valid Git reference]: https://git-scm.com/docs/git-check-ref-format#_description`,
    });
  }
});

export type RefSeparator = z.infer<typeof RefSeparator>;
