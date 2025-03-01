# @lets-release/semver

Internal utilities for handling semantic versions.

## SemVer Specification

This library follows the specification from [semver.org][],
but with some extra constraints.

### Prerelease version

A valid semver prerelease version consists of the following parts:

- Prerelease name (optional)
- Prerelease number (optional)

If there is no prerelease name or the prerelease name starts with a digit,
there MUST always be a hyphen between the main version and the prerelease version.

If there is a prerelease name, the initial prerelease number (0) can be omitted.

The prerelease name and the prerelease number MUST be dot-separated,
unless the prerelease name does not end with a digit.

[semver.org]: https://semver.org
