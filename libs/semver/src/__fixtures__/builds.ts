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

export const buildWithVariable = "---0123.${hash}.abcd---";
