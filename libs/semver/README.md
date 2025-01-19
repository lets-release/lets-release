# @lets-release/semver

Internal utils for handling semantic versions.

## SemVer Specification

This library follow the specification from [semver.org][],
but with some extra constraints.

### Prerelease version

A valid semver prerelease version consists of the following parts:

- Prerelease name (optional)
- Prerelease number (optional)

If there is no prerelease name or the prerelease name is start with a digit,
there MUST always be a hyphen between main version and prerelease version.

If there is a prerelease name, the initial prerelease number (0) could be omitted.

The prerelease name and the prerelease number MUST be dot separated,
unless the prerelease name is not end with a digit.

[semver.org]: https://semver.org
