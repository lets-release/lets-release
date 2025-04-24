# BaseBranchObject

## name (_required_)

**Type**: `string`

The name of the Git branch. A `name` is required for all types of branch.
It can be defined as a [glob][] in which case the definition will be expanded to one per matching branch existing in the repository;
if it doesn’t match any branch, it will be ignored.

[glob]: https://github.com/micromatch/micromatch#matching-features
