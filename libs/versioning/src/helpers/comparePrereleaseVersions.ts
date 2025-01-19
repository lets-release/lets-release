import { isNil } from "lodash-es";

import { compareIdentifierLists } from "src/helpers/compareIdentifierLists";
import { CommonVersion } from "src/types/CommonVersion";

export function comparePrereleaseVersions(a: CommonVersion, b: CommonVersion) {
  const aPrereleaseIdentifiers = [
    ...(a.prereleaseName?.split(".").filter(Boolean) ?? []),
    ...(isNil(a.prereleaseNumber) ? [] : [a.prereleaseNumber]),
  ];
  const bPrereleaseIdentifiers = [
    ...(b.prereleaseName?.split(".").filter(Boolean) ?? []),
    ...(isNil(b.prereleaseNumber) ? [] : [b.prereleaseNumber]),
  ];

  // NOT having a prerelease is > having one
  if (
    aPrereleaseIdentifiers.length > 0 &&
    bPrereleaseIdentifiers.length === 0
  ) {
    return -1;
  } else if (
    aPrereleaseIdentifiers.length === 0 &&
    bPrereleaseIdentifiers.length > 0
  ) {
    return 1;
  } else if (
    aPrereleaseIdentifiers.length === 0 &&
    bPrereleaseIdentifiers.length === 0
  ) {
    return 0;
  }

  return compareIdentifierLists(aPrereleaseIdentifiers, bPrereleaseIdentifiers);
}
