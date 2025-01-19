# @lets-release/release-notes-generator

**[lets-release][]** plugin to generate changelog content with [conventional-changelog][]

| Step            | Description                                                                                          |
|-----------------|------------------------------------------------------------------------------------------------------|
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

With this example:

- the commits that contain `BREAKING CHANGE`, `BREAKING CHANGES` or `BREAKING` in their body will be considered breaking changes (by default the [angular preset][angular] checks only for `BREAKING CHANGE` and `BREAKING CHANGES`)
- the commits will be sorted in the changelog by `subject` then `scope` (by default the [angular preset][angular] sort the commits in the changelog by `scope` then `subject`)

## Configuration

### Options

| Option           | Description                                                                                                                                                                                                                                                              | Default                                                    |
|------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------|
| `preset`         | [conventional-changelog][] preset (possible values: [`angular`][angular], [`atom`][atom], [`codemirror`][codemirror], [`conventionalcommits`][conventionalcommits], [`ember`][ember], [`eslint`][eslint], [`express`][express], [`jquery`][jquery], [`jshint`][jshint]). | [`conventionalcommits`][conventionalcommits]               |
| `presetConfig`   | Additional configuration passed to the [conventional-changelog][] preset. Used for example with [conventional-changelog-conventionalcommits][].                                                                                                                          | -                                                          |
| `config`         | Package name of a custom [conventional-changelog][] preset.                                                                                                                                                                                                              | -                                                          |
| `parserOptions`  | Additional [conventional-commits-parser][] options that will extend the ones loaded by `preset` or `config`. This is convenient to use a [conventional-changelog][] preset with some customizations without having to create a new module.                               | -                                                          |
| `writerOptions`  | Additional [conventional-changelog-writer][] options that will extends the ones loaded by `preset` or `config`. This is convenient to use a [conventional-changelog][] preset with some customizations without having to create a new module.                            | -                                                          |
| `host`           | The host used to generate links to issues and commits. See [conventional-changelog-writer][].                                                                                                                                                                            | The host from the [`repositoryurl`][repositoryurl] option. |
| `linkCompare`    | Whether to include a link to compare changes since previous release in the release note.                                                                                                                                                                                 | `true`                                                     |
| `linkReferences` | Whether to include a link to issues and commits in the release note. See [conventional-changelog-writer][].                                                                                                                                                              | `true`                                                     |
| `commit`         | Keyword used to generate commit links (formatted as `<host>/<owner>/<repository>/<commit>/<commit_sha>`). See [conventional-changelog-writer][].                                                                                                                         | `commits` for Bitbucket repositories, `commit` otherwise   |
| `issue`          | Keyword used to generate issue links (formatted as `<host>/<owner>/<repository>/<issue>/<issue_number>`). See [conventional-changelog-writer][].                                                                                                                         | `issue` for Bitbucket repositories, `issues` otherwise     |

**Notes**: in order to use a `preset` it must be installed (for example to use the [eslint preset][eslint] you must install it with `npm install conventional-changelog-eslint -D`)

**Note**: `config` will be overwritten by the values of `preset`. You should use either `preset` or `config`, but not both.

**Note**: Individual properties of `parserOptions` and `writerOptions` will override ones loaded with an explicitly set `preset` or `config`.
If `preset` or `config` are not set, only the properties set in `parserOptions` and `writerOptions` will be used.

[lets-release]: ../../
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
[angular]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular
[atom]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-atom
[codemirror]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-codemirror
[conventionalcommits]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits
[ember]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-ember
[eslint]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-eslint
[express]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-express
[jquery]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-jquery
[jshint]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-jshint
[conventional-changelog-conventionalcommits]: https://github.com/conventional-changelog/conventional-changelog-config-spec
[conventional-commits-parser]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser
[conventional-changelog-writer]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer
[repositoryurl]: ../../libs/config/src/schemas/Options.ts
