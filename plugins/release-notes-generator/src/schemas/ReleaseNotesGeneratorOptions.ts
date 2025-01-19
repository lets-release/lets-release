import { z } from "zod";

import { NonEmptyString } from "@lets-release/config";
import { ConventionalChangelogOptions } from "@lets-release/conventional-changelog";

export const ReleaseNotesGeneratorOptions = ConventionalChangelogOptions.extend(
  {
    /**
     * The host used to generate links to issues and commits. See
     * [conventional-changelog-writer#host][].
     *
     * Default: the host from the repositoryUrl option.
     *
     * [conventional-changelog-writer#host]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#host
     */
    host: NonEmptyString.optional(),

    /**
     * Whether to include a link to compare changes since previous release in the release note.
     *
     * @default true
     */
    linkCompare: z.boolean().default(true),

    /**
     * Whether to include a link to issues and commits in the release note. See [conventional-changelog-writer#linkReferences][].
     *
     * [conventional-changelog-writer#linkReferences]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#linkreferences
     *
     * @default true
     */
    linkReferences: z.boolean().default(true),

    /**
     * Keyword used to generate commit links (formatted as <host>/<owner>/<repository>/<commit>/<commit_sha>).
     * See [conventional-changelog-writer#commit][].
     *
     * Default: `commits` for Bitbucket repositories, `commit` otherwise
     *
     * [conventional-changelog-writer#commit]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#commit
     */
    commit: NonEmptyString.optional(),

    /**
     * Keyword used to generate issue links (formatted as <host>/<owner>/<repository>/<issue>/<issue_number>).
     * See [conventional-changelog-writer#issue][].
     *
     * Default: `issue` for Bitbucket repositories, `issues` otherwise
     *
     * [conventional-changelog-writer#issue]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer#issue
     */
    issue: NonEmptyString.optional(),
  },
);

export type ReleaseNotesGeneratorOptions = z.input<
  typeof ReleaseNotesGeneratorOptions
>;
