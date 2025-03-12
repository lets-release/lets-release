# @lets-release/pypi

**[lets-release][]** plugin for publishing [PyPI][] packages.

This plugin only supports python projects with valid [`pyproject.toml`][] file.

| Step               | Description                                                         |
|--------------------|---------------------------------------------------------------------|
| `findPackages`     | Find packages in workspace.                                         |
| `verifyConditions` | Verify the authentication method is valid.                          |
| `prepare`          | Update the [`pyproject.toml`][] project version and build packages. |
| `publish`          | Publish the packages to the registry.                               |

## Usage

The plugin can be configured in the **[lets-release][]** configuration file:

```json
{
  "plugins": ["@lets-release/commit-analyzer", "@lets-release/release-notes-generator", "@lets-release/pypi"]
}
```

## Configuration

### Options

| Options          | Description                                                                                                                | Default                                                                                                               |
|------------------|----------------------------------------------------------------------------------------------------------------------------|-----------------------------------------------------------------------------------------------------------------------|
| `skipPublishing` | Whether to publish the package to the registry. If `true`, the [`pyproject.toml`][] project version will still be updated. | `true` if the `project` table in [`pyproject.toml`][] has classifiers beginning with `Private ::`; `false` otherwise. |
| `distDir`        | The output directory to which distributions should be written. Relative to the package root.                               | `dist`                                                                                                                |

### [tool.lets-release] table in pyproject.toml

There are no standard fields in the [`pyproject.toml`][] specification for setting the registry and token for publishing,
and different package managers have different ways of configuring them.
Therefore, this plugin allows reading the [tool.lets-release] configuration table in [`pyproject.toml`][] to obtain the relevant settings,
and this configuration will take precedence over all other configurations.

- `registry`: The registry for publishing.
- `token`: Token for the registry.
- `username`: Username for the registry.
- `password`: Password for the registry.

For example:

```toml
[tool.lets-release]
registry = { name = "testpypi", url = "https://test.pypi.org/simple/", publish-url = "https://test.pypi.org/legacy/" }
token = "${PYPI_TOKEN}"
username = "__token__"
password = "${PYPI_PASSWORD}"
```

**Note**: [PyPI][] does not support publishing with username and password anymore, instead you need to generate a token.
**Note**: If both token and password are configured, token will take precedence over password.
**Note**: Do not save the actual token/password in [`pyproject.toml`][] and commit it to the repo. Use environment variables or temporarily alter [`pyproject.toml`][] file in the CI system.

### Package manager

The supported package managers are: [uv][], and [poetry][].

#### uv

The registry for publishing will be determined in the following order:

1. `registry` config in [tool.lets-release] table, if `publish-url` is set
2. `UV_PUBLISH_URL` as `publish-url` and `UV_PUBLISH_CHECK_URL` as `url`
3. registry found from uv config files, which `name` matches `UV_PUBLISH_INDEX` and `publish-url` is set
4. default to [PyPI][]

The token for publishing will be determined in the following order:

1. `token` config in [tool.lets-release] table
2. `UV_PUBLISH_TOKEN`

The username for publishing will be determined in the following order:

1. `username` config in [tool.lets-release] table
2. `UV_PUBLISH_USERNAME`
3. default to `__token__`

The password for publishing will be determined in the following order:

1. `password` config in [tool.lets-release] table
2. `UV_PUBLISH_PASSWORD`

#### poetry

The registry for publishing will be determined in the following order:

1. registry found in `POETRY_REPOSITORIES_<NAME>_URL` environment variables, which value matches `publish-url` property in `registry` config in [tool.lets-release] table
2. registry found by `poetry config` command, which `publish-url` matches with `registry` config in [tool.lets-release] table
3. registry found in `POETRY_REPOSITORIES_<NAME>_URL` environment variables, which `<NAME>` matches `name` property in `registry` config in [tool.lets-release] table
4. registry found by `poetry config` command, which `name` matches with `registry` config in [tool.lets-release] table

The token for publishing will be determined in the following order:

1. `token` config in [tool.lets-release] table
2. `POETRY_PYPI_TOKEN_<NAME>`
3. value return by `poetry config pypi-token.<name>`

The username for publishing will be determined in the following order:

1. `username` config in [tool.lets-release] table
2. `POETRY_HTTP_BASIC_<NAME>_USERNAME`
3. value return by `poetry config http-basic.<name>.username`
4. default to `__token__`

The password for publishing will be determined in the following order:

1. `password` config in [tool.lets-release] table
2. `POETRY_HTTP_BASIC_<NAME>_PASSWORD`
3. value return by `poetry config http-basic.<name>.password`

[lets-release]: ../../

[PyPI]: https://pypi.org/
[uv]: https://docs.astral.sh/uv
[poetry]: https://python-poetry.org/
