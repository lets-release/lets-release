import { REGULAR_EXPRESSIONS } from "@lets-release/versioning";

// based on "semver" library and semver.org specification
// see: https://regex101.com/r/vkijKf/1/

const { NUMERIC_IDENTIFIER, PRERELEASE, BUILD } = REGULAR_EXPRESSIONS;

// ## Version Core
// Three dot-separated numeric identifiers.
const VERSION_CORE = String.raw`(?<major>${NUMERIC_IDENTIFIER})\.(?<minor>${NUMERIC_IDENTIFIER})\.(?<patch>${NUMERIC_IDENTIFIER})`;

// ## SemVer
// A main version, followed optionally by a pre-release version and
// build metadata.
export const SEMVER = `^${VERSION_CORE}${PRERELEASE}?${BUILD}?$`;
