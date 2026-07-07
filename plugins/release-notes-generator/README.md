# @lets-release/release-notes-generator

**[lets-release][]** plugin for generating changelog content with [conventional-changelog][]

| Step            | Description                                                                                          |
| --------------- | ---------------------------------------------------------------------------------------------------- |
| `generateNotes` | Generate release notes for the commits added since the last release with [conventional-changelog][]. |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "plugins": [
    [
      "@lets-release/commit-analyzer",
      {
        "preset": "angular",
        "parserOptions": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
        }
      }
    ],
    [
      "@lets-release/release-notes-generator",
      {
        "preset": "angular",
        "parserOptions": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES", "BREAKING"]
        },
        "writerOptions": {
          "commitsSort": ["subject", "scope"]
        }
      }
    ]
  ]
}
```

In this example:

- Commits that contain `BREAKING CHANGE`, `BREAKING CHANGES`, or `BREAKING` in their body will be considered breaking changes (by default, the [angular preset][angular] checks only for `BREAKING CHANGE` and `BREAKING CHANGES`)
- Commits will be sorted in the changelog by `subject` then `scope` (by default, the [angular preset][angular] sort the commits in the changelog by `scope` then `subject`)

## Configuration

### Options

| Option           | Description                                                                                                                                                                                                                                                              | Default                                                    |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------- |
| `preset`         | [conventional-changelog][] preset (possible values: [`angular`][angular], [`conventionalcommits`][conventionalcommits]). | [`conventionalcommits`][conventionalcommits]               |
| `presetConfig`   | Additional configuration passed to the [conventional-changelog][] preset. Used for example with [conventional-changelog-conventionalcommits][].                                                                                                                          | -                                                          |
| `config`         | Package name of a custom [conventional-changelog][] preset.                                                                                                                                                                                                              | -                                                          |
| `parserOptions`  | Additional [conventional-commits-parser][] options that will extend the ones loaded by `preset` or `config`. This is convenient to use a [conventional-changelog][] preset with some customizations without having to create a new module.                               | -                                                          |
| `writerOptions`  | Additional [conventional-changelog-writer][] options that will extends the ones loaded by `preset` or `config`. This is convenient to use a [conventional-changelog][] preset with some customizations without having to create a new module.                            | -                                                          |
| `host`           | The host used to generate links to issues and commits. See [conventional-changelog-writer][].                                                                                                                                                                            | The host from the [`repositoryUrl`][repositoryUrl] option. |
| `linkCompare`    | Whether to include a link to compare changes since previous release in the release note.                                                                                                                                                                                 | `true`                                                     |
| `linkReferences` | Whether to include a link to issues and commits in the release note. See [conventional-changelog-writer][].                                                                                                                                                              | `true`                                                     |
| `commit`         | Keyword used to generate commit links (formatted as `<host>/<owner>/<repository>/<commit>/<commit_sha>`). See [conventional-changelog-writer][].                                                                                                                         | `commits` for Bitbucket repositories, `commit` otherwise   |
| `issue`          | Keyword used to generate issue links (formatted as `<host>/<owner>/<repository>/<issue>/<issue_number>`). See [conventional-changelog-writer][].                                                                                                                         | `issue` for Bitbucket repositories, `issues` otherwise     |

**Note**: In order to use a `preset`, it must be installed (for example, to use the [angular preset][angular] you must install it with `npm install conventional-changelog-angular -D`)

**Note**: `config` will be overwritten by the values of `preset`. You should use either `preset` or `config`, but not both.

**Note**: Individual properties of `parserOptions` and `writerOptions` will override ones loaded with an explicitly set `preset` or `config`.
If `preset` or `config` are not set, only the properties set in `parserOptions` and `writerOptions` will be used.

[lets-release]: ../../
[repositoryUrl]: ../../README.md#repositoryUrl

[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
[angular]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular
[conventionalcommits]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits
[conventional-changelog-conventionalcommits]: https://github.com/conventional-changelog/conventional-changelog-config-spec
[conventional-commits-parser]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser
[conventional-changelog-writer]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer
