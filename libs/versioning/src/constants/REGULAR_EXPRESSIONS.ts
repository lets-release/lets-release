// based on "semver" library and semver.org specification
// see: https://regex101.com/r/vkijKf/1/

const POSITIVE_DIGIT = "[1-9]";
const DIGIT = "[0-9]";
const NON_DIGIT = "[a-zA-Z-]";
const IDENTIFIER_CHARACTER = "[0-9a-zA-Z-]";

// ## Numeric Identifier
// A single `0`, or a non-zero digit followed by zero or more digits.
const NUMERIC_IDENTIFIER = String.raw`0|${POSITIVE_DIGIT}${DIGIT}*`;

// ## Alphanumeric Identifier
// Zero or more digits, followed by a letter or hyphen, and then zero or
// more letters, digits, or hyphens.
const ALPHANUMERIC_IDENTIFIER = String.raw`${DIGIT}*${NON_DIGIT}${IDENTIFIER_CHARACTER}*`;

// ## Prerelease Identifier
// A numeric identifier, or a non-numeric identifier.
const PRERELEASE_IDENTIFIER = `(?:${NUMERIC_IDENTIFIER}|${ALPHANUMERIC_IDENTIFIER})`;

// ## Prerelease
// Hyphen, followed by one or more dot-separated pre-release version
// identifiers.
const PRERELEASE = String.raw`(?:-(?<prerelease>${PRERELEASE_IDENTIFIER}(?:\.${PRERELEASE_IDENTIFIER})*))`;

// ## Build Identifier
// Any combination of digits, letters, or hyphens.
const BUILD_IDENTIFIER = `${IDENTIFIER_CHARACTER}+`;

// ## Build
// Plus sign, followed by one or more period-separated build metadata
// identifiers.
const BUILD = String.raw`(?:\+(?<build>${BUILD_IDENTIFIER}(?:\.${BUILD_IDENTIFIER})*))`;

export const REGULAR_EXPRESSIONS = {
  POSITIVE_DIGIT,
  DIGIT,
  NON_DIGIT,
  IDENTIFIER_CHARACTER,
  NUMERIC_IDENTIFIER,
  ALPHANUMERIC_IDENTIFIER,
  PRERELEASE_IDENTIFIER,
  PRERELEASE,
  BUILD_IDENTIFIER,
  BUILD,
};
