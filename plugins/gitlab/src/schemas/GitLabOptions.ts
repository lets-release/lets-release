import { z } from "zod";

import { NonEmptyString, PartialRequired } from "@lets-release/config";
import { GitHostOptions } from "@lets-release/git-host";

import { GitLabAsset } from "src/schemas/GitLabAsset";

export const GitLabOptions = GitHostOptions.extend({
  /**
   * The GitLab Token.
   *
   * Default: `GL_TOKEN` or `GITLAB_TOKEN` environment variable.
   */
  token: NonEmptyString.optional(),

  /**
   * The GitLab OAuth Token.
   */
  oauthToken: NonEmptyString.optional(),

  /**
   * The GitLab CI Job Token.
   *
   * Default: `CI_JOB_TOKEN` environment variable.
   */
  jobToken: NonEmptyString.optional(),

  /**
   * The GitLab endpoint.
   *
   * Default: `CI_SERVER_URL` or get from `repositoryUrl` options.
   */
  url: NonEmptyString.optional(),

  /**
   * The GitLab API endpoint.
   *
   * Default: `CI_API_V4_URL` environment variable.
   */
  apiUrl: NonEmptyString.optional(),

  /**
   * An array of files to upload to the release.
   *
   * A [glob][] can be a `String` (`"dist/**\/*.js"` or `"dist/myLib.js"`) or an `Array`
   * of `String`s that will be globed together (`["dist/**", "!**\/*.css"]`).
   *
   * If a directory is configured, all the files under this directory and its children
   * will be included.
   *
   * The name and label for each assets are generated with [Lodash template][]. The
   * following variables are available:
   *
   * | Property   | Description                                                                                                                                                                                                                                                                                                                        | Default                              |
   * | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ |
   * | `path`     | **Required**, unless `url` is set. A [glob](https://github.com/isaacs/node-glob#glob-primer) to identify the files to upload. Supports [Lodash templating](https://lodash.com/docs#template).                                                                                                                                      | -                                    |
   * | `url`      | Alternative to setting `path` this provides the ability to add links to releases, e.g. URLs to container images. Supports [Lodash templating](https://lodash.com/docs#template).                                                                                                                                                   | -                                    |
   * | `label`    | Short description of the file displayed on the GitLab release. Ignored if `path` matches more than one file. Supports [Lodash templating](https://lodash.com/docs#template).                                                                                                                                                       | File name extracted from the `path`. |
   * | `type`     | Asset type displayed on the GitLab release. Can be `runbook`, `package`, `image` and `other` (see official documents on [release assets](https://docs.gitlab.com/ee/user/project/releases/#release-assets)). Supports [Lodash templating](https://lodash.com/docs#template).                                                       | `other`                              |
   * | `filepath` | A filepath for creating a permalink pointing to the asset (requires GitLab 12.9+, see official documents on [permanent links](https://docs.gitlab.com/ee/user/project/releases/#permanent-links-to-release-assets)). Ignored if `path` matches more than one file. Supports [Lodash templating](https://lodash.com/docs#template). | -                                    |
   * | `target`   | Controls where the file is uploaded to. Can be set to `project_upload` for storing the file as [project upload](https://docs.gitlab.com/ee/api/projects.html#upload-a-file) or `generic_package` for storing the file as [generic package](https://docs.gitlab.com/ee/user/packages/generic_packages/).                            | `project_upload`                     |
   * | `status`   | This is only applied, if `target` is set to `generic_package`. The generic package status. Can be `default` and `hidden` (see official documents on [generic packages](https://docs.gitlab.com/ee/user/packages/generic_packages/)).                                                                                               | `default`                            |
   */
  assets: z.array(GitLabAsset).optional(),

  /**
   * The [assignees][] to add to the issue created when a release fails.
   *
   * [assignees]: https://docs.gitlab.com/ee/user/project/issues/managing_issues.html#assignee
   */
  failureIssueAssignees: z.array(NonEmptyString).max(1).optional(),

  /**
   * An array of milestone titles to associate to the release.
   */
  milestones: z.array(NonEmptyString).optional(),
});

export type GitLabOptions = z.input<typeof GitLabOptions>;

export type ResolvedGitLabOptions = PartialRequired<
  z.output<typeof GitLabOptions>,
  "url" | "proxy"
>;
