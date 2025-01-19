export const xRanges = [
  { range: "1.2" },
  { range: "x.1" },
  { range: "1.2.3" },
  { range: "x.2.3" },
  { range: "x.x.3" },
  {
    range: "1.2.x",
    parsed: {
      major: 1,
      minor: 2,
      patch: "*",
      min: "1.2.0",
      max: "1.3.0",
    },
  },
  {
    range: "1.x",
    isMajor: true,
    parsed: {
      major: 1,
      minor: "*",
      min: "1.0.0",
      max: "2.0.0",
    },
  },
  {
    range: "1.x.x",
    isMajor: true,
    parsed: {
      major: 1,
      minor: "*",
      patch: "*",
      min: "1.0.0",
      max: "2.0.0",
    },
  },
];
