# PrereleaseOptions

## channels

**Type**: `(string | null)[] | Record<string, (string | null)[] | undefined>`

The pre-release distribution channels. If not set, the channel name defaults to the branch name.

## name

**Type**: `string`

The pre-release name (used for both SemVer and CalVer packages). Required when you want a single prerelease identifier for both [schemes][].

## names

**Type**: `Record<VersioningScheme, string>`

The [per-scheme][schemes] prerelease names. Specify separate identifiers for SemVer and CalVer packages. Required when `name` property is not set.

[schemes]: ../../versioning//src/enums/VersioningScheme.ts
