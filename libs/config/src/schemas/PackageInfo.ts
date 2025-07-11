import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import { verifyGitTagName } from "src/helpers/verifyGitTagName";
import { PackageDependency } from "src/schemas/PackageDependency";

/**
 * Package info return by plugin findPackages step.
 */
export const PackageInfo = PackageDependency.extend({
  /**
   * Absolute path to the package root.
   */
  path: NonEmptyString,

  /**
   * Former Name
   */
  formerName: NonEmptyString.optional(),

  /**
   * Package dependencies.
   */
  dependencies: z.array(PackageDependency).optional(),
}).check(async (ctx) => {
  const { type, name } = ctx.value;
  const valid = await verifyGitTagName(`${type}/${name}`);

  if (!valid) {
    ctx.issues.push({
      input: ctx.value,
      code: "custom",
      message: `Package type and name must compile to a [valid Git reference][] in the format "\${type}\${refSeparator}\${name}"

[valid Git reference]: https://git-scm.com/docs/git-check-ref-format#_description`,
    });
  }
});

export type PackageInfo = z.infer<typeof PackageInfo>;
