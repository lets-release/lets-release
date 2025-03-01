import { z } from "zod";

import { GlobPattern } from "@lets-release/config";

import { AssetObject } from "src/schemas/AssetObject";

/**
 * Can be a [glob][] or and `Array` of [globs][glob] and `Object`s with the following properties:
 *
 * | Property | Description                                                    | Default                              |
 * |----------|----------------------------------------------------------------|--------------------------------------|
 * | `path`   | **Required.** A [glob][] to identify the files to upload.      | -                                    |
 * | `name`   | The name of the downloadable file on the GitHub release.       | File name extracted from the `path`. |
 * | `label`  | Short description of the file displayed on the GitHub release. | -                                    |
 *
 * Each entry in the `assets` `Array` is globed individually. A [glob][] can be a `String`
 * (`"dist/**\/*.js"` or `"dist/mylib.js"`) or an `Array` of `String`s that will be globed together
 * (`["dist/**", "!**\/*.css"]`).
 *
 * If a directory is configured, all the files under this directory and its children will be included.
 * The `name` and `label` for each assets are generated with [Lodash template][]. The following variables are available:
 *
 * | Parameter     | Description                                                                         |
 * |---------------|-------------------------------------------------------------------------------------|
 * | `branch`      | The branch from which the release is done.                                          |
 * | `lastRelease` | `Object` with `version`, `gitTag` and `gitHead` of the last release.                |
 * | `nextRelease` | `Object` with `version`, `gitTag`, `gitHead` and `notes` of the release being done. |
 * | `commits`     | `Array` of commit `Object`s with `hash`, `subject`, `body` `message` and `author`.  |
 *
 * **Note**: If a file has a match in `assets` it will be included even if it also has a match in `.gitignore`.
 *
 * [glob]: https://github.com/isaacs/node-glob#glob-primer
 * [Lodash template]: https://lodash.com/docs#template
 */
export const Asset = z.union([GlobPattern, AssetObject]);

export type Asset<T extends AssetObject> = string | string[] | T;
