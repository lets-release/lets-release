# PackageOptions

## paths (_required_)

**Type**: `(string | string[])[]`

Paths to find packages. This option is passed directly to any `findPackages` plugin.

## versioning

**Type**: `SemVerOptions | CalVerOptions`

**Default**:

```typescript
{
  scheme: VersioningScheme.SemVer,
  initialVersion: "1.0.0",
  prerelease: {
    initialNumber: 1,
    ignoreZeroNumber: true,
    prefix: "-",
    suffix: "",
  },
}
```

Versioning options. By default, the SemVer scheme is used. See [SemVerOptions][] and [CalVerOptions][].

## plugins

**Type**: `(string | PluginObject | [string | PluginObject, (T | undefined)?])[]`

**Default**:

```typescript
[
  "@lets-release/commit-analyzer",
  "@lets-release/release-notes-generator",
  "@lets-release/npm",
  "@lets-release/github"
]
```

The list of plugins to run, executed in series for each step they implement.
You can pass options to a plugin by using a tuple `[plugin, options]`.
Plugin can be a string or a [PluginObject][].

## findPackages

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `findPackages` step. If provided, this overrides the `findPackages` configuration of all plugins.
See [StepFunction][].

## verifyConditions

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `verifyConditions` step. If provided, this overrides the `verifyConditions` configuration of all plugins.
See [StepFunction][].

## analyzeCommits

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `analyzeCommits` step. If provided, this overrides the `analyzeCommits` configuration of all plugins.
See [StepFunction][].

## verifyRelease

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `verifyRelease` step. If provided, this overrides the `verifyRelease` configuration of all plugins.
See [StepFunction][].

## generateNotes

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `generateNotes` step. If provided, this overrides the `generateNotes` configuration of all plugins.
See [StepFunction][].

## addChannels

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `addChannels` step. If provided, this overrides the `addChannels` configuration of all plugins.
See [StepFunction][].

## prepare

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `prepare` step. If provided, this overrides the `prepare` configuration of all plugins.
See [StepFunction][].

## publish

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `publish` step. If provided, this overrides the `publish` configuration of all plugins.
See [StepFunction][].

## success

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `success` step. If provided, this overrides the `success` configuration of all plugins.
See [StepFunction][].

## fail

**Type**: `(string | StepFunction | [string | StepFunction, (T | undefined)?])[]`

Spec for the `fail` step. If provided, this overrides the `fail` configuration of all plugins.
See [StepFunction][].

[PluginObject]: ../src/schemas/PluginObject.ts
[StepFunction]: ../src/types/StepFunction.ts

[SemVerOptions]: ../../semver/docs/SemVerOptions.md
[CalVerOptions]: ../../calver/docs/CalVerOptions.md
