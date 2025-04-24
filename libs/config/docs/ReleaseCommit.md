# ReleaseCommit

## assets (_required_)

**Type**: `false | (string | string[])[]`

Files to include in the release commit. Set to `false` to disable adding files to the release commit.

## message

**Type**: `string`

**Default**: `chore(release): [skip ci]\n\n${releases.map(x => x.tag).toSorted().join('\\n')}`

The message for the release commit.
