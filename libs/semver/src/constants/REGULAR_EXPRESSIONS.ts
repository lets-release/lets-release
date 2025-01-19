// from "semver" library

const LETTER_DASH_NUMBER = "[a-zA-Z0-9-]";

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.
const NUMERIC_IDENTIFIER = String.raw`0|[1-9]\d*`;
const NUMERIC_IDENTIFIER_LOOSE = String.raw`\d+`;

// ## Non-numeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.
const NON_NUMERIC_IDENTIFIER = `\\d*[a-zA-Z-]${LETTER_DASH_NUMBER}*`;

// ## Main Version
// Three dot-separated numeric identifiers.
const MAIN_VERSION = `(${NUMERIC_IDENTIFIER})\\.(${NUMERIC_IDENTIFIER})\\.(${NUMERIC_IDENTIFIER})`;
const MAIN_VERSION_LOOSE = `(${NUMERIC_IDENTIFIER_LOOSE})\\.(${NUMERIC_IDENTIFIER_LOOSE})\\.(${NUMERIC_IDENTIFIER_LOOSE})`;

// ## Pre-release Version Identifier
// A numeric identifier, or a non-numeric identifier.
const PRERELEASE_IDENTIFIER = `(?:${NUMERIC_IDENTIFIER}|${NON_NUMERIC_IDENTIFIER})`;
const PRERELEASE_IDENTIFIER_LOOSE = `(?:${NUMERIC_IDENTIFIER_LOOSE}|${NON_NUMERIC_IDENTIFIER})`;

// ## Pre-release Version
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.
const PRERELEASE = `(?:-(${PRERELEASE_IDENTIFIER}(?:\\.${PRERELEASE_IDENTIFIER})*))`;
const PRERELEASE_LOOSE = `(?:-?(${
  PRERELEASE_IDENTIFIER_LOOSE
}(?:\\.${PRERELEASE_IDENTIFIER_LOOSE})*))`;

// ## Build Metadata Identifier
// Any combination of digits, letters, or hyphens.
const BUILD_IDENTIFIER = `${LETTER_DASH_NUMBER}+`;

// ## Build Metadata
// Plus sign, followed by one or more period-separated build metadata
// identifiers.
const BUILD = `(?:\\+(${BUILD_IDENTIFIER}(?:\\.${BUILD_IDENTIFIER})*))`;

// ## Full Version String
// A main version, followed optionally by a pre-release version and
// build metadata.

// Note that the only major, minor, patch, and pre-release sections of
// the version string are capturing groups.  The build metadata is not a
// capturing group, because it should not ever be used in version
// comparison.
const FULL_PLAIN = `v?${MAIN_VERSION}${PRERELEASE}?${BUILD}?`;
const FULL = `^${FULL_PLAIN}$`;

// like full, but allows v1.2.3 and =1.2.3, which people do sometimes.
// also, 1.0.0alpha1 (prerelease without the hyphen) which is pretty
// common in the npm registry.
const LOOSE_PLAIN = `[v=\\s]*${MAIN_VERSION_LOOSE}${PRERELEASE_LOOSE}?${
  BUILD
}?`;
const LOOSE = `^${LOOSE_PLAIN}$`;

export const REGULAR_EXPRESSIONS = {
  LETTER_DASH_NUMBER,
  NUMERIC_IDENTIFIER,
  NUMERIC_IDENTIFIER_LOOSE,
  NON_NUMERIC_IDENTIFIER,
  MAIN_VERSION,
  MAIN_VERSION_LOOSE,
  PRERELEASE_IDENTIFIER,
  PRERELEASE_IDENTIFIER_LOOSE,
  PRERELEASE,
  PRERELEASE_LOOSE,
  BUILD_IDENTIFIER,
  BUILD,
  FULL_PLAIN,
  FULL,
  LOOSE_PLAIN,
  LOOSE,
};
