# CalVerOptions

## scheme (_required_)

**Type**: `VersioningScheme.CalVer`

[Versioning scheme][].

## format (_required_)

**Type**: `string`

CalVer versioning format.

## prerelease

**Type**: `VersioningPrereleaseOptions`

**Default**:

```typescript
{
  initialNumber: 1,
  ignoreZeroNumber: true,
}
```

[VersioningPrereleaseOptions][].

## build

**Type**: `string | true | Record<string, string | true | undefined>`

The calver build metadata spec.
If set to `true`, the tag short hash is used as the build metadata.
If set to a record, the key is the plugin name or `default`.

[Versioning scheme]: ../../versioning/src/enums/VersioningScheme.ts
[VersioningPrereleaseOptions]: ../../versioning/docs/VersioningPrereleaseOptions.md
