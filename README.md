# Let's Release

**lets-release** is modified from [semantic-release][].

**lets-release** automates the whole package release workflow including:
determining the next version numbers,
generating the release notes,
and publishing the packages.

## Differences from semantic-release

- Support both [Semantic Versioning][] and [Calendar Versioning][]
- Support monorepo

## How does it work?

### Commit message format

**lets-release** uses the commit messages to determine the consumer impact of changes in the codebase.
Following formalized conventions for commit messages,
**lets-release** automatically determines the next version numbers,
generates changelogs and publishes the releases.

By default, **lets-release** uses [Conventional Commits][].
The commit message format can be changed with the `preset` or `config` options of the [@lets-release/commit-analyzer][] and [@lets-release/release-notes-generator][] plugins.

Tools such as [commitizen][] or [commitlint][] can be used to help contributors and enforce valid commit messages.

### Automation with CI

**lets-release** is meant to be executed on the CI environment after every successful build on the release branch.
This way no human is directly involved in the release process and the releases are guaranteed to be unromantic and unsentimental.

### Triggering the release process

For each new commit added to one of the release branches (for example: `main`, `next`, `beta`),
with `git push` or by merging a pull request or merging from another branch,
a CI build is triggered and runs the `lets-release` command to make releases if there are codebase changes that affect functionalities of any packages.

## Node version

**lets-release** is only tested with node.js later than version 22.0.0, so the supported range is defined in the `engines.node` property of the `package.json` of our packages as `>=22.0.0`.

## Git version

**lets-release** uses Git CLI commands to read information about the repository such as branches, commit history and tags.
Certain commands and options (such as [the `--merged` option of the `git tag` command][] or bug fixes related to `git ls-files`) used by **lets-release** are only available in Git version 2.7.1 and higher.

## Git authentication

**lets-release** requires push access to the project Git repository in order to create [Git tags][].

The Git authentication can be set with one of the following environment variables:

| Variable                                              | Description                                                                                                                                                                    |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `GH_TOKEN` or `GITHUB_TOKEN`                          | A [GitHub personal access token][].                                                                                                                                            |
| `GL_TOKEN` or `GITLAB_TOKEN`                          | A [GitLab personal access token][].                                                                                                                                            |
| `BB_TOKEN` or `BITBUCKET_TOKEN`                       | A [Bitbucket personal access token][].                                                                                                                                         |
| `BB_TOKEN_BASIC_AUTH` or `BITBUCKET_TOKEN_BASIC_AUTH` | A [Bitbucket personal access token][] with basic auth support. For clarification `user:token` has to be the value of this env.                                                 |
| `GIT_CREDENTIALS`                                     | [URL encoded][] Git username and password in the format `<username>:<password>`. The username and password must each be individually URL encoded, not the `:` separating them. |

Alternatively the Git authentication can be set up via [SSH][].

## Git environment variables

| Variable              | Description                                                                                     | Default                          |
| --------------------- | ----------------------------------------------------------------------------------------------- | -------------------------------- |
| `GIT_AUTHOR_NAME`     | The author name associated with the [Git release tag][]. See [Git environment variables][].     | @lets-release-bot.               |
| `GIT_AUTHOR_EMAIL`    | The author email associated with the [Git release tag][]. See [Git environment variables][].    | @lets-release-bot email address. |
| `GIT_COMMITTER_NAME`  | The committer name associated with the [Git release tag][]. See [Git environment variables][].  | @lets-release-bot.               |
| `GIT_COMMITTER_EMAIL` | The committer email associated with the [Git release tag][]. See [Git environment variables][]. | @lets-release-bot email address. |

## Plugins

### Plugin steps

A plugin is a npm module that can implement one or more of the following steps:

| Step               | Description                               | Context                     | Return                   |
| ------------------ | ----------------------------------------- | --------------------------- | ------------------------ |
| `findPackages`     | Find all packages                         | [FindPackagesContext][]     | [FindPackagesResult][]   |
| `verifyConditions` | Verify release conditions                 | [VerifyConditionsContext][] |                          |
| `analyzeCommits`   | Analyze commits to determine release type | [AnalyzeCommitsContext][]   | [AnalyzeCommitsResult][] |
| `verifyRelease`    | Verify if the release can proceed         | [VerifyReleaseContext][]    |                          |
| `generateNotes`    | Generate release notes                    | [GenerateNotesContext][]    | [GenerateNotesResult][]  |
| `addChannels`      | Add release channels                      | [AddChannelsContext][]      | [ReleaseResult][]        |
| `prepare`          | Prepare resources for release             | [PrepareContext][]          |                          |
| `publish`          | Publish packages to registry              | [PublishContext][]          | [ReleaseResult][]        |
| `success`          | Handle post-release success               | [SuccessContext][]          |                          |
| `fail`             | Handle post-release failure               | [FailContext][]             |                          |

### Official plugins

- [@lets-release/commit-analyzer][]
- [@lets-release/release-notes-generator][]
- [@lets-release/npm][]
- [@lets-release/github][]
- [@lets-release/gitlab][]
- [@lets-release/changelog][]
- [@lets-release/exec][]
- [@lets-release/pypi][]

## Configuration

### Configuration file

**lets-release** use [cosmiconfig][] for loading configuration, see [cosmiconfig][] docs for supported files.

### Plugin configuration

#### Plugin execution order

Plugin execution order is first determined by release steps (such as verifyConditions → analyzeCommits).
At each step, plugins are executed in the order in which they are defined.

#### Plugin options

A plugin configuration can be specified by wrapping the name and an options object in an array.
Options configured this way will be passed only to that specific plugin.

### Options

See [Options][].

[@lets-release/commit-analyzer]: ./plugins/commit-analyzer
[@lets-release/release-notes-generator]: ./plugins/release-notes-generator
[@lets-release/npm]: ./plugins/npm
[@lets-release/github]: ./plugins/github
[@lets-release/gitlab]: ./plugins/gitlab
[@lets-release/changelog]: ./plugins/changelog
[@lets-release/exec]: ./plugins/exec
[@lets-release/pypi]: ./plugins/pypi

[Options]: ./libs/config/docs/Options.md
[FindPackagesContext]: ./libs/config/src/types/FindPackagesContext.ts
[FindPackagesResult]: ./libs/config/src/schemas/FindPackagesResult.ts
[VerifyConditionsContext]: ./libs/config/src/types/VerifyConditionsContext.ts
[AnalyzeCommitsContext]: ./libs/config/src/types/AnalyzeCommitsContext.ts
[AnalyzeCommitsResult]: ./libs/config/src/schemas/AnalyzeCommitsResult.ts
[VerifyReleaseContext]: ./libs/config/src/types/VerifyReleaseContext.ts
[GenerateNotesContext]: ./libs/config/src/types/GenerateNotesContext.ts
[GenerateNotesResult]: ./libs/config/src/schemas/GenerateNotesResult.ts
[AddChannelsContext]: ./libs/config/src/types/AddChannelsContext.ts
[PrepareContext]: ./libs/config/src/types/PrepareContext.ts
[PublishContext]: ./libs/config/src/types/PublishContext.ts
[ReleaseResult]: ./libs/config/src/schemas/ReleaseResult.ts
[SuccessContext]: ./libs/config/src/types/SuccessContext.ts
[FailContext]: ./libs/config/src/types/FailContext.ts

[semantic-release]: https://github.com/semantic-release/semantic-release
[Semantic Versioning]: https://smever.org
[Calendar Versioning]: https://calver.org
[Conventional Commits]: https://www.conventionalcommits.org
[commitizen]: https://github.com/commitizen/cz-cli
[commitlint]: https://github.com/conventional-changelog/commitlint
[the `--merged` option of the `git tag` command]: https://git-scm.com/docs/git-tag/2.7.0#git-tag---no-mergedltcommitgt
[Git tags]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[GitHub personal access token]: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
[GitLab personal access token]: https://docs.gitlab.com/user/profile/personal_access_tokens/
[Bitbucket personal access token]: https://confluence.atlassian.com/bitbucketserver/personal-access-tokens-939515499.html
[URL encoded]: https://en.wikipedia.org/wiki/Percent-encoding
[SSH]: https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols#_the_ssh_protocol
[Git release tag]: https://git-scm.com/book/en/v2/Git-Basics-Tagging
[Git environment variables]: https://git-scm.com/book/en/v2/Git-Internals-Environment-Variables#_committing
[cosmiconfig]: https://github.com/cosmiconfig/cosmiconfig
