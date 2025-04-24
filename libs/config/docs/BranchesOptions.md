# BranchOptions

## main

**Type**: `string | ReleaseBranchObject`

**Default**: `(main|master)`

Glob or [ReleaseBranchObject][] matching your primary release branch.

## next

**Type**: `string | ReleaseBranchObject`

**Default**: `next`

Glob or [ReleaseBranchObject][] for the “next” release branch, used to publish next major or next minor versions.

## nextMajor

**Type**: `string | ReleaseBranchObject`

**Default**: `next-major`

Glob or [ReleaseBranchObject][] for the “next-major” release branch, used to publish next major versions.

## maintenance

**Type**: `(string | MaintenanceBranchObject)[]`

**Default**: `["+([0-9])?(.{+([0-9]),x}).x", "+(+([0-9])[._-])?(x[._-])x"]`

Array of glob or [MaintenanceBranchObject][] matching maintenance branches by semantic (e.g. `1.x`, `2.3.x`) or calendar (e.g. `2021.x`) version ranges.

## prerelease

**Type**: `(string | PrereleaseBranchObject)[]`

**Default**: `["alpha", "beta", "rc"]`

Array of glob or [PrereleaseBranchObject][] for prerelease branches, used to publish prereleases.

[ReleaseBranchObject]: ./ReleaseBranchObject.md
[MaintenanceBranchObject]: ./MaintenanceBranchObject.md
[PrereleaseBranchObject]: ./PrereleaseBranchObject.md
