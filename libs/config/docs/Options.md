# Options

## prerelease

**Type**: `string`

The key to retrieve prerelease options from the `prereleases` property. Used for making a pre-release from a release or maintenance branch.

## dryRun

**Type**: `boolean`

Dry-run mode: skips publishing and only prints next versions and release notes.

## skipCiVerifications

**Type**: `boolean`

If `true`, skips Continuous Integration environment verifications (allows making releases locally).

## debug

**Type**: `boolean`

Output debugging information.

## repositoryUrl

**Type**: `string`

**Default**: _`repository` property in `package.json` or Git origin_

The Git repository URL. Any valid Git URL format is supported (see [Git protocols][]).

## tagFormat

**Type**: `string`

**Default**: `v${version}`

The Git tag format used by **lets-release** to identify releases. Generated with [Lodash][] template function,
compiled with the `version` variable (and package name joined by `refSeparator` in a monorepo).

**Note**: Must contain the `version` variable exactly once and compile to a valid Git reference.

## refSeparator

**Type**: `string`

**Default**: `/`

The separator used by **lets-release** to identify tags and branches with package name.

**Note**: Must be a valid Git reference string.

## mainPackage

**Type**: `string`

The main package name. Used to determine the version format and maintenance-branch format without package name.
If not set and only one package is found in the workspace, that package will be used as the main package.

## releaseCommit

**Type**: [`ReleaseCommit`][]

Release commit options. If not set, **lets-release** will not generate a release commit.

## releaseFollowingDependencies

**Type**: `boolean`

If `true`, the final release type of a dependent package will be the highest of its own release type and the release types of all its dependencies,
and the release notes will contain information about dependency version updates.

## bumpMinorVersionCommit

**Type**: [`BumpVersionCommit`][]

**Default**:

```typescript
{
  subject: "feat: bump ${name} to ${version}",
}
```

This option is only used for generating release notes when `releaseFollowingDependencies` is `true` and the release type is `minor`.

## bumpMajorVersionCommit

**Type**: [`BumpVersionCommit`][]

**Default**:

```typescript
{
  subject: "feat!: bump ${name} to ${version}",
}
```

This option is only used for generating release notes when `releaseFollowingDependencies` is `true` and the release type is `major`.

## branches

**Type**: [`BranchesOptions`][]

**Default**:

```typescript
{
  main: "(main|master)",
  next: "next",
  nextMajor: "next-major",
  maintenance: ["+([0-9])?(.{+([0-9]),x}).x", "+(+([0-9])[._-])?(x[._-])x"],
  prerelease: ["alpha", "beta", "rc"],
}
```

The branches on which releases should happen.

## sharedWorkspaceFiles

**Type**: `(string | string[])[]`

List of files shared between packages in a monorepo.

## packages (_required_)

**Type**: `PackageOptions[]`

List of [PackageOptions][]. Each entry configures paths, versioning scheme (SemVer/CalVer), plugins and per-step plugin overrides.

[`BumpVersionCommit`]: ./BumpVersionCommit.md
[`ReleaseCommit`]: ./ReleaseCommit.md
[`BranchesOptions`]: ./BranchesOptions.md
[PackageOptions]: ./PackageOptions.md

[Git protocols]: https://git-scm.com/book/en/v2/Git-on-the-Server-The-Protocols
[Lodash]: https://github.com/lodash/lodash
