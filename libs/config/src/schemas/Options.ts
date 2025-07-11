import { z } from "zod";

import { NonEmptyString } from "@lets-release/versioning";

import {
  BranchesOptions,
  NormalizedBranchesOptions,
} from "src/schemas/BranchesOptions";
import {
  BumpVersionCommit,
  NormalizedBumpVersionCommit,
} from "src/schemas/BumpVersionCommit";
import { CliOptions } from "src/schemas/CliOptions";
import { GlobPattern } from "src/schemas/GlobPattern";
import {
  NormalizedPackageOptions,
  PackageOptions,
} from "src/schemas/PackageOptions";
import { RefSeparator } from "src/schemas/RefSeparator";
import {
  NormalizedReleaseCommit,
  ReleaseCommit,
} from "src/schemas/ReleaseCommit";
import { TagFormat } from "src/schemas/TagFormat";
import { PartialRequired } from "src/types/PartialRequired";

export const Options = CliOptions.extend({
  repositoryUrl: NonEmptyString.optional(),
  tagFormat: TagFormat.default("v${version}"),
  refSeparator: RefSeparator.default("/"),
  mainPackage: NonEmptyString.optional(),
  releaseCommit: ReleaseCommit.optional(),
  releaseFollowingDependencies: z.boolean().optional(),
  bumpMinorVersionCommit: BumpVersionCommit.default({
    subject: "feat: bump ${name} to v${version}",
  }),
  bumpMajorVersionCommit: BumpVersionCommit.default({
    subject: "feat!: bump ${name} to v${version}",
  }),
  branches: BranchesOptions.default(BranchesOptions.parse({})),
  sharedWorkspaceFiles: z.array(GlobPattern).optional(),
  packages: z.array(PackageOptions).min(1),
});

/**
 * lets-release options.
 *
 * Can be used to set any core option or plugin options.
 */
export interface Options extends CliOptions {
  /**
   * The git repository url.
   *
   * Any valid git url format is supported (see [git protocols][])
   *
   * Default: `repository` property in `package.json`, or git origin url.
   *
   * [git protocols]: https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols
   */
  repositoryUrl?: string;

  /**
   * The git tag format used by **lets-release** to identify releases. The tag name
   * is generated with [Lodash template][] and will be compiled with the `version`
   * variable (and the package name joined by the `refSeparator` in monorepo).
   *
   * **Note**: The `tagFormat` must contain the `version` variable exactly once and
   * compile to a [valid git reference][].
   *
   * [Lodash template]: https://lodash.com/docs#template
   * [valid git reference]: https://git-scm.com/docs/git-check-ref-format#_description
   *
   * @default v${version}
   */
  tagFormat?: string;

  /**
   * The separator used by **lets-release** to identify tags and branches
   * with package name.
   *
   * **Note**: The `refSeparator` must be a valid git reference string.
   *
   * @default /
   */
  refSeparator?: string;

  /**
   * Release commit options.
   *
   * If not set, **lets-release** will not generate a release commit.
   */
  releaseCommit?: ReleaseCommit;

  /**
   * If set to `true`, the final release type of dependent package will be the highest
   * one of its own release type and the release types of all its dependencies.
   */
  releaseFollowingDependencies?: boolean;

  /**
   * This option is only used for generating release notes when `releaseFollowingDependencies`
   * is `true` and the release type is `minor`.
   *
   * Default: { subject: "feat: bump ${name} to v${version}" }
   */
  bumpMinorVersionCommit?: BumpVersionCommit;

  /**
   * This option is only used for generating release notes when `releaseFollowingDependencies`
   * is `true` and the release type is `major`.
   *
   * Default: { subject: "feat!: bump ${name} to v${version}" }
   */
  bumpMajorVersionCommit?: BumpVersionCommit;

  /**
   * The branches on which releases should happen. By default
   * **lets-release** will release:
   *
   *  * regular releases to the default distribution channel from the
   *    branch `main` or `master`
   *  * regular releases to a distribution channel matching the branch
   *    name from any existing branch with a name matching a maintenance
   *    semantic release range (`N.N.x` or `N.x.x` or `N.x` with `N`
   *    being a number, and/or prefix with `{package}{refSeparator}`) or
   *    a maintenance calendar release range (`(\\d+[._-])+(x[._-])?x`,
   *    and/or prefix with `{package}{refSeparator}`)
   *  * regular releases to the `next` distribution channel from the
   *    branch `next` if it exists
   *  * regular releases to the `next-minor` distribution channel from the
   *    branch `next-minor` if it exists
   *  * regular releases to the `next-major` distribution channel from
   *    the branch `next-major` if it exists.
   *  * prereleases to the `alpha` distribution channel from the branch
   *    `alpha` if it exists
   *  * prereleases to the `beta` distribution channel from the branch
   *    `beta` if it exists
   *  * prereleases to the `rc` distribution channel from the branch
   *    `rc` if it exists
   *
   * **Note**: Once **lets-release** is configured, any user with the
   * permission to push commits on one of those branches will be able to
   * publish a release. It is recommended to protect those branches, for
   * example with [GitHub protected branches][].
   *
   * [GitHub protected branches]: https://help.github.com/articles/about-protected-branches
   */
  branches?: BranchesOptions;

  /**
   * List of files shared between packages in a monorepo.
   */
  sharedWorkspaceFiles?: (string | string[])[];

  /**
   * The main package name.
   *
   * Main package is used to determine the version format and the maintenance
   * branch format without package name.
   *
   * If not set and only one package found in workspace, it will be used as
   * main package.
   */
  mainPackage?: string;

  /**
   * Package options list.
   */
  packages: PackageOptions[];
}

/**
 * Normalized lets-release options in context.
 */
export interface NormalizedOptions
  extends PartialRequired<
    Options,
    "repositoryUrl" | "tagFormat" | "refSeparator"
  > {
  bumpMinorVersionCommit: NormalizedBumpVersionCommit;
  bumpMajorVersionCommit: NormalizedBumpVersionCommit;
  releaseCommit?: NormalizedReleaseCommit;
  branches: NormalizedBranchesOptions;
  packages: NormalizedPackageOptions[];
}
