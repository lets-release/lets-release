const minPrerelease = "2001.0.0-alpha";
const minAlpha = "2001.0.0-alpha";
const minBeta = "2001.0.0-beta";
const min = "2001.0.0";
const maxAlpha = "2002.0.0-alpha.88";
const maxBeta = "2002.0.0-beta.99";
const max = "2002.0.0";
const list = [
  minPrerelease,
  minBeta,
  maxAlpha,
  maxBeta,
  "2001.0.0-alpha2",
  "2001.0.0-beta.2",
  "2001.2.0-alpha.3",
  "2001.2.0-beta.2",
  "2001.3.0-alpha",
  "2001.3.0-beta.5",
  "2002.0.0-alpha",
  "2002.0.0-alpha.34",
  "2002.0.0-beta",
  "2002.0.0-beta.76",
];

export const comparisons: Record<
  string,
  {
    minPrerelease?: string;
    minAlpha?: string;
    minBeta?: string;
    min: string;
    maxAlpha?: string;
    maxBeta?: string;
    max: string;
    versions: string[];
  }
> = {
  YYYY: {
    min: "2001",
    max: "2024",
    versions: ["2003", "2020", "2014"],
  },
  "YYYY.MINOR.MICRO": {
    minPrerelease,
    minAlpha,
    minBeta,
    min,
    maxAlpha,
    maxBeta,
    max,
    versions: list,
  },
  "YYYY.MICRO": {
    min: "2001.3",
    max: "2024.0",
    versions: ["2003.4", "2020.3", "2014.0"],
  },
  "0Y": {
    min: "01",
    max: "24",
    versions: ["03", "20", "14"],
  },
  YY: {
    min: "1",
    max: "24",
    versions: ["3", "20", "14"],
  },
  "YYYY.0W": {
    min: "2001.52",
    max: "2024.04",
    versions: ["2003.06", "2020.45", "2014.12"],
  },
  "YYYY.0W.MINOR.MICRO": {
    min: "2001.02.1.0",
    max: "2024.12.0.4",
    versions: ["2003.13.0.1", "2020.20.2.3", "2014.12.1.0"],
  },
  "YYYY.0W.MICRO": {
    min: "2001.03.1",
    max: "2024.12.0",
    versions: ["2003.11.0", "2020.33.0", "2014.12.4"],
  },
  YYYY0W: {
    min: "200101",
    max: "202410",
    versions: ["200303", "202020", "201412"],
  },
  "YYYY.WW": {
    min: "2001.1",
    max: "2024.23",
    versions: ["2003.12", "2020.3", "2014.34"],
  },
  "YYYY.0M": {
    min: "2001.01",
    max: "2024.09",
    versions: ["2003.12", "2020.03", "2014.02"],
  },
  "YYYY.0M.MINOR.MICRO": {
    min: "2001.01.12.0",
    max: "2024.09.1.30",
    versions: ["2003.12.1.0", "2020.04.0.1", "2014.09.0.0"],
  },
  "YYYY.0M.MICRO": {
    min: "2001.01.2",
    max: "2024.09.12",
    versions: ["2003.03.30", "2020.12.1", "2014.10.0"],
  },
  "YYYY.0M.0D": {
    min: "2001.12.01",
    max: "2024.03.09",
    versions: ["2003.02.12", "2020.12.09", "2014.08.10"],
  },
  "YYYY.0M.0D.MINOR.MICRO": {
    min: "2001.01.01.0.0",
    max: "2024.09.09.9.9",
    versions: ["2003.01.01.12.20", "2020.12.12.1.2", "2014.01.09.0.0"],
  },
  "YYYY.0M.0D.MICRO": {
    min: "2001.01.01.2",
    max: "2024.09.09.12",
    versions: ["2003.08.12.1", "2020.09.28.2", "2014.03.03.0"],
  },
  "YYYY.0M.DD": {
    min: "2001.01.1",
    max: "2024.01.10",
    versions: ["2003.12.3", "2020.09.19", "2014.10.8"],
  },
  "YYYY.0M0D": {
    min: "2001.0102",
    max: "2024.0903",
    versions: ["2003.1230", "2020.0607", "2014.0928"],
  },
  YYYY0M: {
    min: "200112",
    max: "202409",
    versions: ["200303", "202012", "201410"],
  },
  "YYYY0M.0D": {
    min: "200112.01",
    max: "202409.12",
    versions: ["200301.20", "202012.23", "201403.12"],
  },
  "YYYY0M.DD": {
    min: "200112.1",
    max: "202409.12",
    versions: ["200312.12", "202010.1", "201409.8"],
  },
  YYYY0M0D: {
    min: "20010101",
    max: "20240910",
    versions: ["20031201", "20201010", "20140909"],
  },
  "YYYY.MM": {
    min: "2001.1",
    max: "2024.12",
    versions: ["2003.2", "2020.10", "2014.6"],
  },
  "YYYY.MM.0D": {
    min: "2001.1.01",
    max: "2024.12.12",
    versions: ["2003.2.01", "2020.10.09", "2014.6.20"],
  },
  "YYYY.MM.DD": {
    min: "2001.1.1",
    max: "2024.12.12",
    versions: ["2003.2.1", "2020.10.9", "2014.6.20"],
  },
};
