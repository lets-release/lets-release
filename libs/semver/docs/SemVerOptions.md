# SemVerOptions

## scheme (_required_)

**Type**: `VersioningScheme.SemVer`

[Versioning scheme][].

## initialVersion

**Type**: `string`

**Default**: `1.0.0`

Initial version of the package.

## prerelease

**Type**: `SemVerPrereleaseOptions`

**Default**:

```typescript
{
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: "",
}
```

[Pre-release options][].

## build

**Type**: `string | true | Record<string, string | true | undefined>`

The semver build metadata spec.
If set to `true`, the tag short hash is used as the build metadata.
If set to a record, the key is the plugin name or `default`.

[Pre-release options]: ./SemVerPrereleaseOptions.md

[Versioning scheme]: ../../versioning/src/enums/VersioningScheme.ts
