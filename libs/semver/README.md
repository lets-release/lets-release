# @lets-release/semver

**[lets-release][]**  internal utilities for handling semantic versions.

## SemVer Specification

This library follows the specification from [semver.org][].

### Prerelease version

Prerelease versions typically consist of two parts: a prerelease name and a prerelease number.
When the prerelease name is not empty and is not purely numeric, the prerelease number 0 can be omitted, such as 1.0.0-alpha.
However, note that if both 1.0.0-alpha and 1.0.0-alpha.0 exist, then 1.0.0-alpha < 1.0.0-alpha.0.

[lets-release]: ../../

[semver.org]: https://semver.org
