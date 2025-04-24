# @lets-release/changelog

**[lets-release][]** plugin for creating or updating a changelog file.

| Step               | Description                                                                                                                       |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| `verifyConditions` | Verify the `changelogFile` and `changelogTitle` options configuration.                                                            |
| `prepare`          | Create or update a changelog file in the local project directory using the changelog content created in the `generateNotes` step. |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "releaseCommit": {
    "assets": ["docs/CHANGELOG.md"]
  },
  "plugins": [
    "@lets-release/commit-analyzer",
    "@lets-release/release-notes-generator",
    [
      "@lets-release/changelog",
      {
        "changelogFile": "docs/CHANGELOG.md"
      }
    ],
  ]
}
```

With this example, for each release, a `docs/CHANGELOG.md` will be created or updated.

## Configuration

### Options

| Options          | Description                                           | Default        |
| ---------------- | ----------------------------------------------------- | -------------- |
| `changelogFile`  | File path of the changelog.                           | `CHANGELOG.md` |
| `changelogTitle` | Title of the changelog file (first line of the file). | -              |

### Examples

When used with the [@lets-release/npm][] plugins,
the `@lets-release/changelog` plugin must be called before the `@lets-release/npm` plugin in order to update the changelog file,
so the `@lets-release/npm` plugin can include it in the release.

```json
{
  "plugins": [
    "@lets-release/commit-analyzer",
    "@lets-release/release-notes-generator",
    "@lets-release/changelog",
    "@lets-release/npm",
  ]
}
```

[lets-release]: ../../
[@lets-release/npm]: ../npm
