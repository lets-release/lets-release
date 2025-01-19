# @lets-release/npm

**[lets-release][]** plugin to publish a [npm][] package.

| Step               | Description                                                               |
|--------------------|---------------------------------------------------------------------------|
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

### Registry authentication

Automation tokens are recommended since they can be used for an automated workflow, even when your account is configured to use the [`auth-and-writes` level of 2FA][].

### Provenance

If you are publishing to the official registry and your pipeline is on a [provider that is supported by npm for provenance][], npm can be configured to [publish with provenance][].

Since lets-release wraps the npm publish command, configuring provenance is not exposed directly.
Instead, provenance can be configured through the [other configuration options exposed by npm][].
Provenance applies specifically to publishing, so our recommendation is to configure under `publishConfig` within the `package.json`.

#### Provenance on GitHub Actions

For package provenance to be signed on the GitHub Actions CI the following permission is required
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

| Options          | Description                                                                                                       | Default                                                                         |
|------------------|-------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------------------------------|
| `skipPublishing` | Whether to publish the `npm` package to the registry. If `true` the `package.json` version will still be updated. | `true` if the `package.json` [private][] property is `true`, `false` otherwise. |
| `tarballDir`     | Directory path in which to write the package tarball. If not set the tarball is not be kept on the file system.   | -                                                                               |

### Package manager

The plugin uses [`preferred-pm`][preferred-pm] to get your package manager.

### Publish configuration

The [`registry`][registry] can be configured under `publishConfig` in the `package.json`:

```json
{
  "publishConfig": {
    "registry": "https://registry.npmjs.org/",
    "tag": "latest"
  }
}
```

**Notes**:

- The presence of `registry` under `publishConfig` in the `package.json` will take precedence over the configuration in `.npmrc` and `NPM_CONFIG_REGISTRY`

### Examples

The `skipPublishing` and `tarballDir` option can be used to skip the publishing to the `npm` registry and instead,
release the package tarball with another plugin. For example with the [@lets-release/github][] plugin:

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
[npm]: https://www.npmjs.com
[create]: https://docs.npmjs.com/cli/pack
[Add a release to dist-tags]: https://docs.npmjs.com/cli/dist-tag
[Publish the npm package]: https://docs.npmjs.com/cli/publish
[`auth-and-writes` level of 2FA]: https://docs.npmjs.com/about-two-factor-authentication#authorization-and-writes
[provider that is supported by npm for provenance]: https://docs.npmjs.com/generating-provenance-statements#provenance-limitations
[publish with provenance]: https://docs.npmjs.com/generating-provenance-statements
[other configuration options exposed by npm]: https://docs.npmjs.com/generating-provenance-statements#using-third-party-package-publishing-tools
[@lets-release/github]: ../github
[private]: https://docs.npmjs.com/files/package.json#private
[preferred-pm]: https://www.npmjs.com/package/preferred-pm
[registry]: https://docs.npmjs.com/misc/registry
