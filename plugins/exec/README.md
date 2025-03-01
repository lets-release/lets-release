# @lets-release/exec

**[lets-release][]** plugin for executing custom shell commands.

| Step               | Description                                                                                          |
|--------------------|------------------------------------------------------------------------------------------------------|
| `findPackages`     | Execute a shell command to find packages in the workspace.                                           |
| `verifyConditions` | Execute a shell command to verify if the release should happen.                                      |
| `analyzeCommits`   | Execute a shell command to determine the type of release.                                            |
| `verifyRelease`    | Execute a shell command to verify a release that was determined before and is about to be published. |
| `generateNotes`    | Execute a shell command to generate the release note.                                                |
| `addChannels`      | Execute a shell command to add channels to merge releases.                                           |
| `prepare`          | Execute a shell command to prepare the release.                                                      |
| `publish`          | Execute a shell command to publish the release.                                                      |
| `success`          | Execute a shell command to notify of a new release.                                                  |
| `fail`             | Execute a shell command to notify of a failed release.                                               |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "plugins": [
    "@lets-release/commit-analyzer",
    "@lets-release/release-notes-generator",
    ["@lets-release/exec", {
      "verifyConditionsCmd": "./verify.sh",
      "publishCmd": "./publish.sh ${nextRelease.version} ${branch.name} ${commits.length} ${Date.now()}"
    }],
  ]
}
```

In this example:

- the shell command `./verify.sh` will be executed during the [verifyConditions step][steps]
- the shell command `./publish.sh 1.0.0 master 3 870668040000` (for the release of version `1.0.0` from branch `master` with `3` commits on `August 4th, 1997 at 2:14 AM`) will be executed on the [publish step][steps]

**Note**: It is required to define a plugin for the [analyzeCommits step][steps].
If no [analyzeCommitsCmd][] is defined the plugin [@lets-release/commit-analyzer][] must be defined in the `plugins` list.

## Configuration

### Options

| Options               | Description                                                                                                                                                                                                                                                                                                                  |
|-----------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `findPackagesCmd`     | The shell command to be executed during the `findPackages` step. See [findPackagesCmd][].                                                                                                                                                                                                                                    |
| `verifyConditionsCmd` | The shell command to be executed during the `verifyConditions` step. See [verifyConditionsCmd][].                                                                                                                                                                                                                            |
| `analyzeCommitsCmd`   | The shell command to be executed during the `analyzeCommits` step. See [analyzeCommitsCmd][].                                                                                                                                                                                                                                |
| `verifyReleaseCmd`    | The shell command to be executed during the `verifyRelease` step. See [verifyReleaseCmd][].                                                                                                                                                                                                                                  |
| `generateNotesCmd`    | The shell command to be executed during the `generateNotes` step. See [generateNotesCmd][].                                                                                                                                                                                                                                  |
| `addChannelsCmd`      | The shell command to be executed during the `addChannels` step. See [addChannelsCmd][].                                                                                                                                                                                                                                      |
| `prepareCmd`          | The shell command to be executed during the `prepare` step. See [prepareCmd][].                                                                                                                                                                                                                                              |
| `publishCmd`          | The shell command to be executed during the `publish` step. See [publishCmd][].                                                                                                                                                                                                                                              |
| `successCmd`          | The shell command to be executed during the `success` step. See [successCmd][].                                                                                                                                                                                                                                              |
| `failCmd`             | The shell command to be executed during the `fail` step. See [failCmd][].                                                                                                                                                                                                                                                    |
| `shell`               | The shell to use to run the command. See [execa][].                                                                                                                                                                                                                                                                          |
| `cwd`                 | The path to use as current working directory when executing the shell commands. This path is relative to the path from which **lets-release** is running. For example if **lets-release** runs from `/my-project` and `cwd` is set to `buildScripts` then the shell command will be executed from `/my-project/buildScripts` |

Each shell command is generated with [Lodash template][]. All the objects passed to the [lets-release][] plugins are available as template options.

## findPackagesCmd

| Command property | Description                                                                                                                                                                                                      |
|------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error.                                                                                                  |
| `stdout`         | The `packages` should be written to `stdout` as stringified JSON (for example `{"name": "pkg", "path": "/path/to/pkg"}`). If the command write non-stringified JSON to `stdout`, no `packages` will be returned. |
| `stderr`         | Can be used for logging.                                                                                                                                                                                         |

## verifyConditionsCmd

| Command property | Description                                                              |
|------------------|--------------------------------------------------------------------------|
| `exit code`      | `0` if the verification is successful, or any other exit code otherwise. |
| `stdout`         | Only the reason for the verification failure should be written.          |
| `stderr`         | Can be used for logging.                                                 |

## analyzeCommitsCmd

| Command property | Description                                                                                                                                                  |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error.                                              |
| `stdout`         | Only the release type (`major`, `minor` or `patch` etc.) should be written to `stdout`. If no release has to be done the command must not write to `stdout`. |
| `stderr`         | Can be used for logging.                                                                                                                                     |

## verifyReleaseCmd

| Command property | Description                                                                 |
|------------------|-----------------------------------------------------------------------------|
| `exit code`      | `0` if the verification is successful, or any other exit code otherwise.    |
| `stdout`         | Only the reason for the verification failure should be written to `stdout`. |
| `stderr`         | Can be used for logging.                                                    |

## generateNotesCmd

| Command property | Description                                                                                                     |
|------------------|-----------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error. |
| `stdout`         | Only the release notes should be written to `stdout`.                                                           |
| `stderr`         | Can be used for logging.                                                                                        |

## prepareCmd

| Command property | Description                                                                                                     |
|------------------|-----------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error. |
| `stdout`         | Can be used for logging.                                                                                        |
| `stderr`         | Can be used for logging.                                                                                        |

## addChannelsCmd

| Command property | Description                                                                                                                                                                                                                                            |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error.                                                                                                                                        |
| `stdout`         | The `release` information can be written to `stdout` as stringified JSON (for example `{"name": "Release name", "url": "http://url/release/1.0.0"}`). If the command writes non-parseable JSON to `stdout`, no `release` information will be returned. |
| `stderr`         | Can be used for logging.                                                                                                                                                                                                                               |

## publishCmd

| Command property | Description                                                                                                                                                                                                                                            |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error.                                                                                                                                        |
| `stdout`         | The `release` information can be written to `stdout` as stringified JSON (for example `{"name": "Release name", "url": "http://url/release/1.0.0"}`). If the command writes non-parseable JSON to `stdout`, no `release` information will be returned. |
| `stderr`         | Can be used for logging.                                                                                                                                                                                                                               |

## successCmd

| Command property | Description                                                                                                     |
|------------------|-----------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error. |
| `stdout`         | Can be used for logging.                                                                                        |
| `stderr`         | Can be used for logging.                                                                                        |

## failCmd

| Command property | Description                                                                                                     |
|------------------|-----------------------------------------------------------------------------------------------------------------|
| `exit code`      | Any non `0` code is considered as an unexpected error and will stop the `lets-release` execution with an error. |
| `stdout`         | Can be used for logging.                                                                                        |
| `stderr`         | Can be used for logging.                                                                                        |

[findPackagesCmd]: #findpackagescmd
[verifyConditionsCmd]: #verifyconditionscmd
[analyzeCommitsCmd]: #analyzecommitscmd
[verifyReleaseCmd]: #verifyreleasecmd
[generateNotesCmd]: #generatenotescmd
[addChannelsCmd]: #addchannelscmd
[prepareCmd]: #preparecmd
[publishCmd]: #publishcmd
[successCmd]: #successcmd
[failCmd]: #failcmd

[lets-release]: ../../
[@lets-release/commit-analyzer]: ../commit-analyzer
[steps]: ../../libs/config/src/enums/Step.ts

[execa]: https://github.com/sindresorhus/execa
[Lodash template]: https://lodash.com/docs#template
