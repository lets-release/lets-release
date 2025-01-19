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
    value: "abcd_0123",
  },
  {
    value: "",
    isValid: true,
  },
  {
    value: "abcd.0123",
    isValid: true,
  },
  {
    value: "0123.abcd",
    isValid: true,
  },
  {
    value: "0123.0123",
    isValid: true,
  },
  {
    value: "---abcd.0123---",
    isValid: true,
  },
];

export const prereleaseNameWithVariable = "---0123.${name}.abcd---";
