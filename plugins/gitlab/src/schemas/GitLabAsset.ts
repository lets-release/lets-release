import { z } from "zod";

import { GlobPattern } from "@lets-release/config";

import { GitLabAssetObject } from "src/schemas/GitLabAssetObject";

/**
 * Can be a [glob][] or and `Array` of [globs][glob] and `Object`s with the following properties:
 *
 * | Property   | Description                                                                                                                                                                                                     | Default                              |
 * |------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
 * | `path`     | **Required**, unless `url` is set. A [glob][] to identify the files to upload. Supports [Lodash templating][].                                                                                                  | -                                    |
 * | `url`      | Alternative to setting `path` this provides the ability to add links to releases, e.g. URLs to container images. Supports [Lodash templating][].                                                                | -                                    |
 * | `label`    | Short description of the file displayed on the GitLab release. Ignored if `path` matches more than one file. Supports [Lodash templating][].                                                                    | File name extracted from the `path`. |
 * | `type`     | Asset type displayed on the GitLab release. Can be `runbook`, `package`, `image` and `other` (see official documents on [release assets][]). Supports [Lodash templating][].                                    | `other`                              |
 * | `filepath` | A filepath for creating a permalink pointing to the asset (requires GitLab 12.9+, see official documents on [permanent links][]). Ignored if `path` matches more than one file. Supports [Lodash templating][]. | -                                    |
 * | `target`   | Controls where the file is uploaded to. Can be set to `project_upload` for storing the file as [project upload][] or `generic_package` for storing the file as [generic package][].                             | `project_upload`                     |
 * | `status`   | This is only applied, if `target` is set to `generic_package`. The generic package status. Can be `default` and `hidden` (see official documents on [generic packages][generic package]).                       | `default`                            |
 *
 * Each entry in the `assets` `Array` is globed individually. A [glob][]
 * can be a `String` (`"dist/**\/*.js"` or `"dist/mylib.js"`) or an `Array` of `String`s that will be globed together
 * (`["dist/**", "!**\/*.css"]`).
 *
 * If a directory is configured, all the files under this directory and its children will be included.
 *
 * **Note**: If a file has a match in `assets` it will be included even if it also has a match in `.gitignore`.
 *
 * [glob]: https://github.com/isaacs/node-glob#glob-primer
 * [Lodash templating]: https://lodash.com/docs#template
 * [release assets]: https://docs.gitlab.com/ee/user/project/releases/#release-assets
 * [permanent links]: https://docs.gitlab.com/ee/user/project/releases/#permanent-links-to-release-assets
 * [project upload]: https://docs.gitlab.com/ee/api/projects.html#upload-a-file
 * [generic package]: https://docs.gitlab.com/ee/user/packages/generic_packages/
 */
export const GitLabAsset = z.union([GlobPattern, GitLabAssetObject]);

export type GitLabAsset = z.input<typeof GitLabAsset>;

export type ResolvedGitLabAsset = z.output<typeof GitLabAsset>;
