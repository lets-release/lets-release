# @lets-release/calver

Internal utilities for handling calendar versions and schemes.

## CalVer Specification

This library follows the specification from [calver.org][],
but with some additional constraints.

### Scheme

A valid calver scheme consists of the following parts:

#### Major Version (required)

A major version is a calendar-based version, which can use the following tokens:

- YYYY - Full year - 2006, 2016, 2106
- YY - Short year - 6, 16, 106
- 0Y - Zero-padded year - 06, 16, 106
- MM - Short month - 1, 2 ... 11, 12
- 0M - Zero-padded month - 01, 02 ... 11, 12
- WW - Short week (since start of year) - 1, 2, 33, 52
- 0W - Zero-padded week - 01, 02, 33, 52
- DD - Short day - 1, 2 ... 30, 31
- 0D - Zero-padded day - 01, 02 ... 30, 31

##### Constraints

1. Any token value MUST be a positive integer.
2. Only `.`, `_`, `-` are valid separators.
3. `MM`, `WW`, `DD` MUST separate from other token with a separator.
4. Duplicate tokens are not allowed. For example, `YYYY` cannot use with `YY` or `0Y`.
5. Year token is required.
6. Week token MUST be a valid week number of the year.
7. Week token MUST NOT be used with month token or day token.
8. Month token MUST be a valid month.
9. Day token MUST be a valid day of the month and year.
10. Day token MUST be used with month token.

#### Minor Version (optional, MUST be used with micro version)

A minor version MUST be a non-negative integer, and separated from major version with a separator.

#### Micro Version (optional)

A micro version MUST be a non-negative integer, and separated from major version or minor version with a separator.

#### Modifier (optional)

A modifier can consist of the following parts:

##### Prerelease Version

A prerelease version MUST be a series of dot separated identifiers and the first character MUST NOT be a digit.
Identifiers MUST consist of only ASCII alphanumerics, hyphens, and dashes `[0-9A-Za-z_-]`.
A prerelease MUST immediately follow the main version, and MAY be separated with a separator.

##### Build Metadata

A build metadata MUST be a series of dot separated identifiers.
Identifiers MUST consist of only ASCII alphanumerics, hyphens, and dashes `[0-9A-Za-z_-]`.
A build metadata MUST be the last part and MUST be separated with a plug `+`.

[calver.org]: https://calver.org
