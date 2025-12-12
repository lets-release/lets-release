export const builds = [
  {
    value: "",
  },
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
    value: "---abcd.0123---",
    isValid: true,
  },
];

export const buildWithVariable = "---0123.${hash}.abcd---";
