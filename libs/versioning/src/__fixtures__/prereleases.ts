export const prereleaseNames = [
  {
    value: "abcd.",
  },
  {
    value: ".abcd",
  },
  {
    value: "abcd..abcd",
  },
  {
    value: "abcd_123",
  },
  {
    value: "abcd.0123",
  },
  {
    value: "",
    isValid: true,
  },
  {
    value: "abcd.123",
    isValid: true,
  },
  {
    value: "123.abcd",
    isValid: true,
  },
  {
    value: "123.123",
    isValid: true,
  },
  {
    value: "---abcd.123---",
    isValid: true,
  },
];

export const prereleaseNameWithVariable = "---0123.${name}.abcd---";
