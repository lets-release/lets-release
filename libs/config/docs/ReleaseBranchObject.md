# ReleaseBranchObject (_extends [BaseBranchObject][]_)

## channels

**Type**: `(string | null)[] | Record<string, (string | null)[] | undefined>`

The distribution channels on which to publish releases from this branch. Applies only to release or maintenance branches.
If not set, `[null]` is used for the main release branch; for others, the channel name defaults to the branch name.

## prereleases

**Type**: `Record<string, PrereleaseOptions>`

The prerelease options record for this branch. Applies only to release or maintenance branches.
Defines custom prerelease channel names and configurations.

[BaseBranchObject]: ./BaseBranchObject.md
