# BumpVersionCommit

## subject (_required_)

**Type**: `string`

The subject of the commit for dependency version bump.
The subject is generated with [Lodash template][] and will be compiled with the `name` variable and `version` variable.

## body

**Type**: `string`

The body of the commit for dependency version bump.
The body is generated with [Lodash template][] and will be compiled with the `name` variable and `version` variable.
If not specified, the commit will only have a subject line.

[Lodash template]: https://lodash.com/docs#template
