export const identifiers = [
  "abcd.0123",
  "0123.abcd",
  "0123.0123",
  "---abcd.0123---",
  "___0123.abcd___",
];

export const invalidIdentifiers = [
  "",
  "abcd.",
  ".abcd",
  "abcd..abcd",
  "abcd$0123",
];

export const buildWithVariable = "___0123.${hash}.abcd___";

export const prereleaseNameWithVariable = "___0123.${name}.abcd___";
