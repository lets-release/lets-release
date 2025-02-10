# @lets-release/gitlab

**[lets-release][]** plugin to publish a [GitLab release][].

| Step               | Description                                                                                          |
|--------------------|------------------------------------------------------------------------------------------------------|
| `verifyConditions` | Verify the presence and the validity of the authentication and the [assets][] option configuration.  |
| `addChannels`      | Update a [GitLab release][].                                                                         |
| `publish`          | Publish a [GitLab release][].                                                                        |
| `success`          | Add a comment to each [GitLab Issue][] or Merge Request resolved by the release.                     |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "branches": ["main"],
  "plugins": [
    "@lets-release/commit-analyzer",
    "@lets-release/release-notes-generator",
    [
      "@lets-release/gitlab",
      {
        "gitlabUrl": "https://custom.gitlab.com",
        "assets": [
          { "path": "dist/asset.min.css", "label": "CSS distribution" },
          { "path": "dist/asset.min.js", "label": "JS distribution", "target": "generic_package" },
          { "path": "dist/asset.min.js", "label": "v${nextRelease.version}.js" },
          { "url": "https://gitlab.com/gitlab-org/gitlab/-/blob/master/README.md" }
        ]
      }
    ]
  ]
}
```

With this example [GitLab releases][Gitlab release] will be published to the `https://custom.gitlab.com` instance.

## Configuration

### GitLab authentication

The GitLab authentication configuration is **required** and can be set via [environment variables][].

There are three kinds of token, see [@gitbeaker/rest][] for details.
The personal token can be set via the `GL_TOKEN` or `GITLAB_TOKEN` environment variable.

The token must have the `api` scope.
If you are using token as the [remote Git repository authentication][] it must also have the `write_repository` scope.

**Note**: When running with `dryRun` only `read_repository` scope is required.

### Environment variables

| Variable                     | Description                                          |
|------------------------------|------------------------------------------------------|
| `GL_TOKEN` or `GITLAB_TOKEN` | The personal token used to authenticate with GitLab. |
| `CI_JOB_TOKEN`               | The GitLab CI job token.                             |
| `CI_SERVER_URL`              | The GitLab endpoint.                                 |
| `CI_API_V4_URL`              | The GitLab API URL.                                  |

### Options

| Option                     | Description                                                                                                                                                          | Default                                            |
|----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| `token`                    | The GitLab personal token.                                                                                                                                           | `GH_TOKEN` or `GITHUB_TOKEN` environment variable. |
| `oauthToken`               | The GitLab OAuth token.                                                                                                                                              | -                                                  |
| `jobToken`                 | The GitLab CI job token.                                                                                                                                             | `CI_JOB_TOKEN` environment variable.               |
| `url`                      | The GitLab endpoint.                                                                                                                                                 | `CI_SERVER_URL` environment variable.              |
| `apiUrl`                   | The GitLab API URL.                                                                                                                                                  | `CI_API_V4_URL` environment variable.              |
| `assets`                   | An array of files to upload to the release. See [assets][].                                                                                                          | -                                                  |
| `positionOfOtherArtifacts` | The position to add other artifact links to the GitLab Release. Can be `"bottom"` or `"top"`. Default to not add any links.                                          | -                                                  |
| `mainPackageOnly`          | Create releases for the main package only                                                                                                                            | `false`                                            |
| `releaseNameTemplate`      | A [Lodash template][] to customize the gitlab release's name                                                                                                         | `${nextRelease.tag}`                               |
| `releaseBodyTemplate`      | A [Lodash template][] to customize the gitlab release's body                                                                                                         | `${nextRelease.notes}`                             |
| `commentOnSuccess`         | Use this as condition, when to comment on issues or pull requests. See [commentOnSuccess][]                                                                          | `true`                                             |
| `successComment`           | The comment to add to each issue and pull request resolved by the release. Set to `false` to disable commenting on issues and pull requests. See [successComment][]. | generate by [getSuccessComment][] function         |
| `successLabels`            | The [labels][] to add to each issue and pull request resolved by the release. See [successLabels][].                                                                 | -                                                  |
| `milestones`               | An array of milestone titles to associate to the release. See [GitLab Release API][].                                                                                | -                                                  |

#### assets

Can be a [glob][] or an `Array` of [globs][glob] or an `Object`s with the following properties:

| Property   | Description                                                                                                                                                                               | Default                              |
|------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|--------------------------------------|
| `path`     | **Required**, unless `url` is set. A [glob][] to identify the files to upload.                                                                                                            | -                                    |
| `url`      | Alternative to setting `path` this provides the ability to add links to releases, e.g. URLs to container images.                                                                          | -                                    |
| `label`    | Short description of the file displayed on the GitLab release. Ignored if `path` matches more than one file.                                                                              | File name extracted from the `path`. |
| `type`     | Asset type displayed on the GitLab release. Can be `runbook`, `package`, `image` and `other` (see official documents on [release assets][]).                                              | `other`                              |
| `filepath` | A filepath for creating a permalink pointing to the asset (requires GitLab 12.9+, see official documents on [permanent links][]). Ignored if `path` matches more than one file.           | -                                    |
| `target`   | Controls where the file is uploaded to. Can be set to `project_upload` for storing the file as [project upload][] or `generic_package` for storing the file as [generic package][].       | `project_upload`                     |
| `status`   | This is only applied, if `target` is set to `generic_package`. The generic package status. Can be `default` and `hidden` (see official documents on [generic packages][generic package]). | `default`                            |

Each entry in the `assets` `Array` is globed individually.
A [glob][] can be a `String` (`"dist/**/*.js"` or `"dist/mylib.js"`) or an `Array` of `String`s that will be globed together (`["dist/**", "!**/*.css"]`).

If a directory is configured, all the files under this directory and its children will be included.

The `label` for each asset are generated with [Lodash template][]. The following variables are available:

| Parameter     | Description                                |
|---------------|--------------------------------------------|
| `branch`      | The branch from which the release is done. |
| `lastRelease` | The last release.                          |
| `nextRelease` | The release being done.                    |
| `commits`     | `Array` of commit `Object`s.               |

**Note**: If a file has a match in `assets` it will be included even if it also has a match in `.gitignore`.

##### assets examples

`'dist/*.js'`: include all the `js` files in the `dist` directory, but not in its sub-directories.

`[['dist', '!**/*.css']]`: include all the files in the `dist` directory and its sub-directories excluding the `css` files.

`[{path: 'dist/MyLibrary.js', label: 'MyLibrary JS distribution'}, {path: 'dist/MyLibrary.css', label: 'MyLibrary CSS distribution'}]`: include the `dist/MyLibrary.js` and `dist/MyLibrary.css` files,
and label them `MyLibrary JS distribution` and `MyLibrary CSS distribution` in the GitLab release.

`[['dist/**/*.{js,css}', '!**/*.min.*'], {path: 'build/MyLibrary.zip', label: 'MyLibrary'}]`: include all the `js` and `css` files in the `dist` directory and its sub-directories excluding the minified version,
plus the `build/MyLibrary.zip` file and label it `MyLibrary` in the GitLab release.

#### commentOnSuccess

A `boolean` or a function returns a `boolean` or `Promise<boolean>` to determine whether to comment to issues and merge requests on success. The following variables are available:

| Parameter     | Description                                                                                                              |
|---------------|--------------------------------------------------------------------------------------------------------------------------|
| `branch`      | The branch from which the release is done.                                                                               |
| `lastRelease` | The last release.                                                                                                        |
| `nextRelease` | The release being done.                                                                                                  |
| `commits`     | `Array` of commit `Object`s.                                                                                             |
| `artifacts`   | `Array` of artifact `Object`s.                                                                                           |
| `issue`       | A [GitLab API Merge Request object][] for merge requests related to a commit, or [GitLab API Issue object][] for issues. |

#### successComment

The message for the issue comments is generated with [Lodash template][]. The following variables are available:

| Parameter     | Description                                                                                                              |
|---------------|--------------------------------------------------------------------------------------------------------------------------|
| `branch`      | The branch from which the release is done.                                                                               |
| `lastRelease` | The last release.                                                                                                        |
| `nextRelease` | The release being done.                                                                                                  |
| `commits`     | `Array` of commit `Object`s.                                                                                             |
| `artifacts`   | `Array` of artifact `Object`s.                                                                                           |
| `issue`       | A [GitLab API Merge Request object][] for merge requests related to a commit, or [GitLab API Issue object][] for issues. |

#### successLabels

Each label name is generated with [Lodash template][]. The following variables are available:

| Parameter     | Description                                                                                                              |
|---------------|--------------------------------------------------------------------------------------------------------------------------|
| `branch`      | The branch from which the release is done.                                                                               |
| `lastRelease` | The last release.                                                                                                        |
| `nextRelease` | The release being done.                                                                                                  |
| `commits`     | `Array` of commit `Object`s.                                                                                             |
| `artifacts`   | `Array` of artifact `Object`s.                                                                                           |
| `issue`       | A [GitLab API Merge Request object][] for merge requests related to a commit, or [GitLab API Issue object][] for issues. |

## Compatibility

The latest version of this plugin is compatible with all currently-supported versions of GitLab,
[which is the current major version and previous two major versions][].
This plugin is not guaranteed to work with unsupported versions of GitLab.

[environment variables]: #environment-variables
[assets]: #assets
[commentOnSuccess]: #commentonsuccess
[successComment]: #successcomment
[successLabels]: #successlabels

[lets-release]: ../../
[getSuccessComment]: ../../libs/git-host/src/helpers/getSuccessComment.ts

[GitLab release]: https://docs.gitlab.com/ee/user/project/releases/
[GitLab Issue]: https://docs.gitlab.com/ee/user/project/issues/
[remote Git repository authentication]: https://github.com/lets-release/lets-release/blob/master/docs/usage/ci-configuration.md#authentication
[labels]: https://docs.gitlab.com/ee/user/project/labels.html#labels
[GitLab Release API]: https://docs.gitlab.com/ee/api/releases/#create-a-release
[release assets]: https://docs.gitlab.com/ee/user/project/releases/#release-assets
[permanent links]: https://docs.gitlab.com/ee/user/project/releases/#permanent-links-to-release-assets
[project upload]: https://docs.gitlab.com/ee/api/projects.html#upload-a-file
[generic package]: https://docs.gitlab.com/ee/user/packages/generic_packages/
[GitLab API Merge Request object]: https://docs.gitlab.com/ee/api/merge_requests.html#get-single-mr
[GitLab API Issue object]: https://docs.gitlab.com/ee/api/issues.html#single-issue
[which is the current major version and previous two major versions]: https://about.gitlab.com/support/statement-of-support.html#version-support
[@gitbeaker/rest]: https://github.com/jdalrymple/gitbeaker/tree/main/packages/rest#api-client
[Lodash template]: https://lodash.com/docs#template
[glob]: https://github.com/isaacs/node-glob#glob-primer
