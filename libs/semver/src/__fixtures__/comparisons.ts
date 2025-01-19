import { shuffle } from "lodash-es";

export const comparisons = [
  {
    min: "1.0.0",
    max: "2.0.0",
  },
  {
    min: "1.0.0",
    max: "1.1.0",
  },
  {
    min: "1.0.0",
    max: "1.0.1",
  },
  {
    min: "1.0.0-alpha",
    max: "1.0.0",
  },
  {
    min: "1.0.0-alpha",
    max: "1.0.0-beta",
  },
  {
    min: "1.0.0-alpha",
    max: "1.0.0-alpha.0",
  },
  {
    min: "1.0.0-alpha.1",
    max: "1.0.0-alpha.2",
  },
];

export const minPrerelease = "1.0.0-alpha";
export const minAlpha = "1.0.0-alpha";
export const minBeta = "1.0.0-beta";
export const min = "1.0.0";
export const maxAlpha = "2.0.0-alpha.88";
export const maxBeta = "2.0.0-beta.99";
export const max = "2.0.0";
export const list = shuffle([
  minPrerelease,
  minBeta,
  maxAlpha,
  maxBeta,
  "1.0.0-alpha2",
  "1.0.0-beta.2",
  "1.2.0-alpha.3",
  "1.2.0-beta.2",
  "1.3.0-alpha",
  "1.3.0-beta.5",
  "2.0.0-alpha",
  "2.0.0-alpha.34",
  "2.0.0-beta",
  "2.0.0-beta.76",
]);
