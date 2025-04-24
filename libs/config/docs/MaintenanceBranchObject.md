# MaintenanceBranchObject (_extends [ReleaseBranchObject][]_)

## ranges

**Type**: `Record<string, string | undefined>`

The version ranges this maintenance branch supports. Only applies to maintenance branches;
if omitted but name includes `{package}{refSeparator}{range}`, that range is inferred.
Required for maintenance branches without an embedded range.
Only x range specifiers are supported (e.g. `1.x`, `2.3.x`).

[ReleaseBranchObject]: ./ReleaseBranchObject.md
