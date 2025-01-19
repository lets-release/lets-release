# @lets-release/github

**[lets-release][]** plugin plugin to publish a [GitHub release][] and comment on released Pull Requests/Issues.

| Step               | Description                                                                                         |
|--------------------|-----------------------------------------------------------------------------------------------------|
| `verifyConditions` | Verify the presence and the validity of the authentication and the [assets][] option configuration. |
| `addChannels`      | Update a [GitHub release][].                                                                        |
| `publish`          | Publish a [GitHub release][], optionally uploading file assets.                                     |
| `success`          | Add a comment to each [GitHub Issue][] or [Pull Request][] resolved by the release.                 |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "plugins": [
    "@lets-release/commit-analyzer",
    "@lets-release/release-notes-generator",
    [
      "@lets-release/github",
      {
        "assets": [
          { "path": "dist/asset.min.css", "label": "CSS distribution" },
          { "path": "dist/asset.min.js", "label": "JS distribution" }
        ]
      }
    ]
  ]
}
```

With this example [GitHub releases][GitHub Release] will be published with the file `dist/asset.min.css` and `dist/asset.min.js`.

## Configuration

### GitHub authentication

The GitHub authentication configuration is **required** and can be set via [environment variables][].

The token can be set via the `GH_TOKEN` or `GITHUB_TOKEN` environment variable.
The user associated with the token must have push permission to the repository.

When creating the token, the **minimum required scopes** are:

- [`repo`][] for a private repository
- [`public_repo`][] for a public repository

_Note on GitHub Actions:_ You can use the default token which is provided in the secret _GITHUB_TOKEN_.
However, releases done with this token will NOT trigger release events to start other workflows.
If you have actions that trigger on newly created releases,
please use a generated token for that and store it in your repository's secrets (any other name than _GITHUB_TOKEN_ is fine).

When using the _GITHUB_TOKEN_, the **minimum required permissions** are:

- `contents: write` to be able to publish a GitHub release
- `issues: write` to be able to comment on released issues
- `pull-requests: write` to be able to comment on released pull requests

### Environment variables

| Variable                       | Description                                 |
|--------------------------------|---------------------------------------------|
| `GH_TOKEN` or `GITHUB_TOKEN`   | The token used to authenticate with GitHub. |
| `GITHUB_SERVER_URL`            | The GitHub server endpoint.                 |
| `GITHUB_API_URL`               | The GitHub API endpoint.                    |

### Options

| Option                      | Description                                                                                                                                                          | Default                                            |
|-----------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------|----------------------------------------------------|
| `token`                     | The GitHub token.                                                                                                                                                    | `GH_TOKEN` or `GITHUB_TOKEN` environment variable. |
| `url`                       | The GitHub server endpoint.                                                                                                                                          | `GITHUB_SERVER_URL` environment variable.          |
| `apiUrl`                    | The GitHub API endpoint.                                                                                                                                             | `GITHUB_API_URL` environment variable.             |
| `proxy`                     | The proxy to use to access the GitHub API. Set to `false` to disable usage of proxy. Can be `false`, a proxy URL or an [undici][] `ProxyAgent` options.              | `http_proxy` or `HTTP_PROXY` environment variable. |
| `assets`                    | An array of files to upload to the release. See [assets][].                                                                                                          | -                                                  |
| `positionOfOtherArtifacts`  | The position to add other artifact links to the GitHub Release. Can be `"bottom"` or `"top"`. Default to not add any links.                                          | -                                                  |
| `mainPackageOnly`           | Create releases for the main package only                                                                                                                            | `false`                                            |
| `makeLatestMainPackageOnly` | Set the release as latest for the main package only                                                                                                                  | `true`                                             |
| `releaseNameTemplate`       | A [Lodash template][] to customize the github release's name                                                                                                         | `${nextRelease.tag}`                               |
| `releaseBodyTemplate`       | A [Lodash template][] to customize the github release's body                                                                                                         | `${nextRelease.notes}`                             |
| `commentOnSuccess`          | Use this as condition, when to comment on issues or pull requests. See [commentOnSuccess][]                                                                          | `true`                                             |
| `successComment`            | The comment to add to each issue and pull request resolved by the release. Set to `false` to disable commenting on issues and pull requests. See [successComment][]. | generate by [getSuccessComment][] function         |
| `successLabels`             | The [labels][] to add to each issue and pull request resolved by the release. See [successLabels][].                                                                 | -                                                  |
| `draftRelease`              | A boolean indicating if a GitHub Draft Release should be created instead of publishing an actual GitHub Release.                                                     | `false`                                            |
| `discussionCategoryName`    | The category name in which to create a linked discussion to the release.                                                                                             | -                                                  |

#### assets

Can be a [glob][] or an `Array` of [globs][glob] or an `Object`s with the following properties:

| Property | Description                                                    | Default                              |
|----------|----------------------------------------------------------------|--------------------------------------|
| `path`   | **Required.** A [glob][] to identify the files to upload.      | -                                    |
| `name`   | The name of the downloadable file on the GitHub release.       | File name extracted from the `path`. |
| `label`  | Short description of the file displayed on the GitHub release. | -                                    |

Each entry in the `assets` `Array` is globed individually.
A [glob][] can be a `String` (`"dist/**/*.js"` or `"dist/mylib.js"`) or an `Array` of `String`s that will be globed together (`["dist/**", "!**/*.css"]`).

If a directory is configured, all the files under this directory and its children will be included.

The `name` and `label` for each asset are generated with [Lodash template][]. The following variables are available:

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
and label them `MyLibrary JS distribution` and `MyLibrary CSS distribution` in the GitHub release.

`[['dist/**/*.{js,css}', '!**/*.min.*'], {path: 'build/MyLibrary.zip', label: 'MyLibrary'}]`: include all the `js` and `css` files in the `dist` directory and its sub-directories excluding the minified version,
plus the `build/MyLibrary.zip` file and label it `MyLibrary` in the GitHub release.

`[{path: 'dist/MyLibrary.js', name: 'MyLibrary-${nextRelease.gitTag}.js', label: 'MyLibrary JS (${nextRelease.gitTag}) distribution'}]`: include the file `dist/MyLibrary.js` and upload it to the GitHub release with name `MyLibrary-v1.0.0.js` and label `MyLibrary JS (v1.0.0) distribution` which will generate the link:

> `[MyLibrary JS (v1.0.0) distribution](MyLibrary-v1.0.0.js)`

#### commentOnSuccess

A `boolean` or a function returns a `boolean` or `Promise<boolean>` to determine whether to comment to issues and pull requests on success. The following variables are available:

| Parameter     | Description                                                                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `branch`      | The branch from which the release is done.                                                                                                      |
| `lastRelease` | The last release.                                                                                                                               |
| `nextRelease` | The release being done.                                                                                                                         |
| `commits`     | `Array` of commit `Object`s.                                                                                                                    |
| `artifacts`   | `Array` of artifact `Object`s.                                                                                                                  |
| `issue`       | A [GitHub API Pull Request object][] for pull requests related to a commit, or [GitHub API Issue object][] for issues resolved via [keywords][] |

#### successComment

The message for the issue comments is generated with [Lodash template][]. The following variables are available:

| Parameter     | Description                                                                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `branch`      | The branch from which the release is done.                                                                                                      |
| `lastRelease` | The last release.                                                                                                                               |
| `nextRelease` | The release being done.                                                                                                                         |
| `commits`     | `Array` of commit `Object`s.                                                                                                                    |
| `artifacts`   | `Array` of artifact `Object`s.                                                                                                                  |
| `issue`       | A [GitHub API Pull Request object][] for pull requests related to a commit, or [GitHub API Issue object][] for issues resolved via [keywords][] |

##### successComment example

The `successComment` `This ${issue.pull_request ? 'pull request' : 'issue'} is included in version ${nextRelease.version}` will generate the comment:

> This pull request is included in version 1.0.0

#### successLabels

Each label name is generated with [Lodash template][]. The following variables are available:

| Parameter     | Description                                                                                                                                     |
|---------------|-------------------------------------------------------------------------------------------------------------------------------------------------|
| `branch`      | The branch from which the release is done.                                                                                                      |
| `lastRelease` | The last release.                                                                                                                               |
| `nextRelease` | The release being done.                                                                                                                         |
| `commits`     | `Array` of commit `Object`s.                                                                                                                    |
| `artifacts`   | `Array` of artifact `Object`s.                                                                                                                  |
| `issue`       | A [GitHub API Pull Request object][] for pull requests related to a commit, or [GitHub API Issue object][] for issues resolved via [keywords][] |

##### successLabels example

The `successLabels` ``['released<%= nextRelease.channel ? ` on @\${nextRelease.channel}` : "" %> from <%= branch.name %>']`` will generate the label:

> released on @next from branch next

[lets-release]: ../../
[GitHub release]: https://help.github.com/articles/about-releases
[GitHub Issue]: https://help.github.com/articles/about-issues
[Pull Request]: https://help.github.com/articles/about-pull-requests
[`repo`]: https://github.com/settings/tokens/new?scopes=repo
[`public_repo`]: https://github.com/settings/tokens/new?scopes=public_repo
[labels]: https://help.github.com/articles/about-labels
[GitHub API Pull Request object]: https://docs.github.com/en/rest/pulls/pulls?apiVersion=2022-11-28#get-a-pull-request
[GitHub API Issue object]: https://docs.github.com/en/rest/issues/issues?apiVersion=2022-11-28#get-an-issue
[keywords]: https://help.github.com/articles/closing-issues-using-keywords
[Lodash template]: https://lodash.com/docs#template
[undici]: https://undici.nodejs.org/#/docs/api/ProxyAgent.md
[glob]: https://github.com/isaacs/node-glob#glob-primer
[environment variables]: #environment-variables
[assets]: #assets
[commentOnSuccess]: #commentonsuccess
[successComment]: #successcomment
[successLabels]: #successlabels
[getSuccessComment]: ../../libs/git-host/src/helpers/getSuccessComment.ts
