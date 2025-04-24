# @lets-release/commit-analyzer

**[lets-release][]** plugin for analyzing commits with [conventional-changelog][]

| Step             | Description                                                                         |
| ---------------- | ----------------------------------------------------------------------------------- |
| `analyzeCommits` | Determine the type of release by analyzing commits with [conventional-changelog][]. |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "plugins": [
    [
      "@lets-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": [
          { "type": "docs", "scope": "README", "release": "patch" },
          { "type": "refactor", "release": "patch" },
          { "type": "style", "release": "patch" }
        ],
        "parserOptions": {
          "noteKeywords": ["BREAKING CHANGE", "BREAKING CHANGES"]
        }
      }
    ],
    "@lets-release/release-notes-generator"
  ]
}
```

In this example:

- Commits that contain `BREAKING CHANGE` or `BREAKING CHANGES` in their body will be considered breaking changes.
- Commits with a 'docs' `type`, a 'README' `scope` will be associated with a `patch` release.
- Commits with a 'refactor' `type` will be associated with a `patch` release.
- Commits with a 'style' `type` will be associated with a `patch` release.

**Note**: Your commits must be formatted **exactly** as specified by the chosen convention.
For example, the [Angular Commit Message Conventions][] require the `BREAKING CHANGE` keyword to be followed by a colon (`:`) and to be in the **footer** of the commit message.

## Configuration

### Options

| Option          | Description                                                                                                                                                                                                                                                              | Default                                      |
| --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| `preset`        | [conventional-changelog][] preset (possible values: [`angular`][angular], [`atom`][atom], [`codemirror`][codemirror], [`conventionalcommits`][conventionalcommits], [`ember`][ember], [`eslint`][eslint], [`express`][express], [`jquery`][jquery], [`jshint`][jshint]). | [`conventionalcommits`][conventionalcommits] |
| `presetConfig`  | Additional configuration passed to the [conventional-changelog][] preset. Used, for example, with [conventional-changelog-conventionalcommits][].                                                                                                                        | -                                            |
| `config`        | Package name of a custom [conventional-changelog][] preset.                                                                                                                                                                                                              | -                                            |
| `parserOptions` | Additional [conventional-commits-parser][] options that will extend the ones loaded by `preset` or `config`. This is convenient to use a [conventional-changelog][] preset with some customizations without having to create a new module.                               | -                                            |
| `releaseRules`  | An external module, a path to a module, or an `Array` of rules. See [`releaseRules`][releaseRules].                                                                                                                                                                      | See [`releaseRules`][releaseRules]           |

**Note**: In order to use a `preset`, it must be installed (for example, to use the [eslint preset][eslint], you must install it with `npm install conventional-changelog-eslint -D`)

**Note**: `config` will be overwritten by the values of `preset`. You should use either `preset` or `config`, but not both.

**Note**: Individual properties of `parserOptions` will override those loaded with an explicitly set `preset` or `config`. If `preset` or `config` are not set, only the properties set in `parserOptions` will be used.

#### releaseRules

Release rules are used to decide whether the commits since the last release warrant a new release. If you define custom release rules, the [default release rules][] will be used if nothing matched. Those rules will be matched against the commit objects resulting of [conventional-commits-parser][] parsing. Each rule property can be defined as a [glob][].

##### Rules definition

This is an `Array` of rule objects. A rule object has a `release` property and one or more criteria.

```json
{
  "plugins": [
    [
      "@lets-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": [
          { "type": "docs", "scope": "README", "release": "patch" },
          { "type": "refactor", "scope": "core-*", "release": "minor" },
          { "type": "refactor", "release": "patch" },
          { "scope": "no-release", "release": null }
        ]
      }
    ],
    "@lets-release/release-notes-generator"
  ]
}
```

##### Rules matching

Each commit will be compared with each rule, and when it matches, the commit will be associated with the release type specified in the rule's `release` property. If a commit matches multiple rules, the highest release type (`major` > `minor` > `patch`) is associated with the commit.

See [release types][] for the release types hierarchy.

In the previous example:

- Commits with `type` 'docs' and `scope` 'README' will be associated with a `patch` release.
- Commits with `type` 'refactor' and `scope` starting with 'core-' (i.e. 'core-ui', 'core-rules', ...) will be associated with a `minor` release.
- Other commits with `type` 'refactor' (without `scope` or with a `scope` not matching the glob `core-*`) will be associated with a `patch` release.
- Commits with scope `no-release` will not be associated with a release type.

##### Default rules matching

If a commit doesn't match any rule in `releaseRules` it will be evaluated against the [default release rules][].

In the previous example:

- Commits with a breaking change will be associated with a `major` release.
- Commits with `type` 'feat' will be associated with a `minor` release.
- Commits with `type` 'fix' will be associated with a `patch` release.
- Commits with `type` 'perf' will be associated with a `patch` release.
- Commits with scope `no-release` will not be associated with a release type even if they have a breaking change or the `type` 'feat', 'fix' or 'perf'.

##### No rules matching

If a commit doesn't match any rules in `releaseRules` or in the [default release rules][], then no release type will be associated with the commit.

In the previous example:

- Commits with `type` 'style' will not be associated with a release type.
- Commits with `type` 'test' will not be associated with a release type.
- Commits with `type` 'chore' will not be associated with a release type.

##### Multiple commits

If there are multiple commits that match one or more rules, the one with the highest release type will determine the global release type.

Considering the following commits:

- `docs(README): Add more details to the API docs`
- `feat(API): Add a new method to the public API`

In the previous example the release type determined by the plugin will be `minor`.

##### Specific commit properties

The properties to set in the rules will depend on the chosen commit style. For example [conventional-changelog-angular][angular] use the commit properties `type`, `scope` and `subject` but [conventional-changelog-eslint][eslint] uses `tag` and `message`.

For example with `eslint` preset:

```json
{
  "plugins": [
    [
      "@lets-release/commit-analyzer",
      {
        "preset": "eslint",
        "releaseRules": [
          { "tag": "Docs", "message": "*README*", "release": "patch" },
          { "tag": "New", "release": "patch" }
        ]
      }
    ],
    "@lets-release/release-notes-generator"
  ]
}
```

With this configuration:

- Commits with `tag` 'Docs', that contains 'README' in their header message will be associated with a `patch` release.
- Commits with `tag` 'New' will be associated with a `patch` release.
- Commits with `tag` 'Breaking' will be associated with a `major` release (per [default release rules][]).
- Commits with `tag` 'Fix' will be associated with a `patch` release (per [default release rules][]).
- Commits with `tag` 'Update' will be associated with a `minor` release (per [default release rules][]).
- All other commits will not be associated with a release type.

##### External package / file

`releaseRules` can also reference a module, either by its `npm` package name or path:

```json
{
  "plugins": [
    [
      "@lets-release/commit-analyzer",
      {
        "preset": "angular",
        "releaseRules": "./config/release-rules.cjs"
      }
    ],
    "@lets-release/release-notes-generator"
  ]
}
```

```js
// File: config/release-rules.cjs
module.exports = [
  { type: "docs", scope: "README", release: "patch" },
  { type: "refactor", scope: "core-*", release: "minor" },
  { type: "refactor", release: "patch" },
];
```

[releaseRules]: #releaserules

[lets-release]: ../../
[release types]: ../../libs/config/src/constants/RELEASE_TYPES.ts
[default release rules]: ./src/constants/DEFAULT_RELEASE_RULES.ts

[glob]: https://github.com/micromatch/micromatch#matching-features
[conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
[Angular Commit Message Conventions]: https://github.com/angular/angular.js/blob/master/DEVELOPERS.md#-git-commit-guidelines
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
