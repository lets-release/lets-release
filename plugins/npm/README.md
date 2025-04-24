# @lets-release/npm

**[lets-release][]** plugin for publishing [npm][] packages.

| Step               | Description                                                               |
| ------------------ | ------------------------------------------------------------------------- |
| `findPackages`     | Find packages in workspace.                                               |
| `verifyConditions` | Verify the authentication method is valid.                                |
| `prepare`          | Update the `package.json` version and [create][] the npm package tarball. |
| `addChannels`      | [Add a release to dist-tags][].                                           |
| `publish`          | [Publish the npm package][] to the registry.                              |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "plugins": ["@lets-release/commit-analyzer", "@lets-release/release-notes-generator", "@lets-release/npm"]
}
```

## Configuration

### Provenance

If you are publishing to the official registry and your pipeline is on a [provider that is supported by npm for provenance][], npm can be configured to [publish with provenance][].

Since lets-release wraps the npm publish command, configuring provenance is not directly supported.
Instead, provenance can be configured through [other configuration options exposed by npm][].
Provenance applies specifically to publishing, so we recommend configuring it under `publishConfig` in the `package.json`.

#### Provenance on GitHub Actions

For package provenance to be signed on GitHub Actions CI, the following permission needs
to be enabled on the job:

```yaml
permissions:
  id-token: write # to enable use of OIDC for npm provenance
```

It's worth noting that if you are using lets-release to its fullest with a GitHub release, GitHub comments,
and other features, then [more permissions are required][@lets-release/github] to be enabled on this job:

```yaml
permissions:
  contents: write # to be able to publish a GitHub release
  issues: write # to be able to comment on released issues
  pull-requests: write # to be able to comment on released pull requests
  id-token: write # to enable use of OIDC for npm provenance
```

### Options

| Options          | Description                                                                                                        | Default                                                                         |
| ---------------- | ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------- |
| `skipPublishing` | Whether to publish the `npm` package to the registry. If `true`, the `package.json` version will still be updated. | `true` if the `package.json` [private][] property is `true`; `false` otherwise. |
| `tarballDir`     | Directory path in which to write the package tarball. If not set the tarball will not be kept on the file system.  | -                                                                               |

### Package manager

The plugin uses [`preferred-pm`][preferred-pm] to detect your package manager,
and [`resolve-workspace-root`][resolve-workspace-root] to determine workspace root.
The Supported package managers are [npm][npm cli], [pnpm][], and [yarn][].

### Publish configuration

The [`registry`][registry] can be configured under `publishConfig` in `package.json`:

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest"
  }
}
```

**Notes**:

- The presence of `registry` under `publishConfig` in the `package.json` will take precedence over the configuration in package manager config files
- The auth token can be set in package manager config files (`.npmrc` for npm and pnpm, `.yarnrc.yml` for yarn). Do not save the actual token in config files and commit it to the repo. Use environment variables or temporarily alter config files in the CI system

### Examples

The `skipPublishing` and `tarballDir` options can be used to skip publishing to the `npm` registry and instead
release the package tarball with another plugin. For example, with the [@lets-release/github][] plugin:

```json
{
  "plugins": [
    "@lets-release/commit-analyzer",
    "@lets-release/release-notes-generator",
    [
      "@lets-release/npm",
      {
        "skipPublishing": true,
        "tarballDir": "dist"
      }
    ],
    [
      "@lets-release/github",
      {
        "assets": "dist/*.tgz"
      }
    ]
  ]
}
```

[lets-release]: ../../
[@lets-release/github]: ../github

[npm]: https://www.npmjs.com
[npm cli]: https://docs.npmjs.com/cli
[pnpm]: https://pnpm.io/
[yarn]: https://yarnpkg.com/
[create]: https://docs.npmjs.com/cli/pack
[Add a release to dist-tags]: https://docs.npmjs.com/cli/dist-tag
[Publish the npm package]: https://docs.npmjs.com/cli/publish
[provider that is supported by npm for provenance]: https://docs.npmjs.com/generating-provenance-statements#provenance-limitations
[publish with provenance]: https://docs.npmjs.com/generating-provenance-statements
[other configuration options exposed by npm]: https://docs.npmjs.com/generating-provenance-statements#using-third-party-package-publishing-tools
[private]: https://docs.npmjs.com/files/package.json#private
[preferred-pm]: https://www.npmjs.com/package/preferred-pm
[resolve-workspace-root]: https://github.com/byCedric/resolve-workspace-root
[registry]: https://docs.npmjs.com/misc/registry
