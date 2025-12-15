import { VersioningPrereleaseOptions } from "@lets-release/versioning";

import { validFormats } from "src/__fixtures__/formats";
import { CalVerFormatTokens } from "src/types/CalVerFormatTokens";
import { CalVerTokenValues } from "src/types/CalVerTokenValues";
import { ParsedCalVer } from "src/types/ParsedCalVer";

const year = 1;
const paddedYear = "01";
const fullYear = 2001;
const week = 5;
const paddedWeek = "05";
const month = 6;
const paddedMonth = "06";
const day = 8;
const paddedDay = "08";
const minor = 1;
const looseMinor = "01";
const micro = 0;
const looseMicro = "0";
const build = "build-metadata-test.123";
const parsed = {
  build: undefined,
};

export const calvers: Record<
  string,
  {
    tokens: CalVerFormatTokens;
    tokenValues: CalVerTokenValues;
    values: {
      value: string;
      formatted?: string;
      options?: VersioningPrereleaseOptions;
      parsed?: Omit<ParsedCalVer, "tokens" | "tokenValues">;
    }[];
  }
> = {
  YYYY: {
    tokens: validFormats.YYYY.tokens,
    tokenValues: { year: fullYear },
    values: [
      {
        value: `abcd`,
      },
      {
        value: `12`,
      },
      {
        value: `0123`,
      },
      {
        value: `${fullYear}&`,
      },
      {
        value: `${fullYear}`,
        parsed,
      },
      {
        value: `${fullYear}+${build}`,
        parsed: {
          build,
        },
      },
      {
        value: `${fullYear}-0+build`,
        parsed: {
          prereleaseName: undefined,
          prereleaseNumber: 0,
          build: "build",
        },
      },
      {
        value: `${fullYear}-1`,
        parsed: {
          prereleaseName: undefined,
          prereleaseNumber: 1,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-1.0`,
        options: { initialNumber: 0 },
        parsed: {
          prereleaseName: "1",
          prereleaseNumber: 0,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-1.1`,
        parsed: {
          prereleaseName: "1",
          prereleaseNumber: 1,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha`,
        options: { initialNumber: 0, ignoreZeroNumber: true },
        parsed: {
          prereleaseName: "alpha",
          prereleaseNumber: undefined,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
        parsed: {
          prereleaseName: "alpha",
          prereleaseNumber: undefined,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha.0`,
        options: { initialNumber: 0 },
        parsed: {
          prereleaseName: "alpha",
          prereleaseNumber: 0,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha.1`,
        parsed: {
          prereleaseName: "alpha",
          prereleaseNumber: 1,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha0`,
        options: { initialNumber: 0, ignoreZeroNumber: true },
        parsed: {
          prereleaseName: "alpha0",
          prereleaseNumber: undefined,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha1`,
        formatted: `${fullYear}-alpha1.1`,
        parsed: {
          prereleaseName: "alpha1",
          prereleaseNumber: undefined,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
        parsed: {
          prereleaseName: "alpha",
          prereleaseNumber: undefined,
          build: undefined,
        },
      },
      {
        value: `${fullYear}-alpha1`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
        parsed: {
          prereleaseName: "alpha1",
          prereleaseNumber: undefined,
          build: undefined,
        },
      },
    ],
  },
  "YYYY.MINOR.MICRO": {
    tokens: validFormats["YYYY.MINOR.MICRO"].tokens,
    tokenValues: { year: fullYear, minor, micro },
    values: [
      {
        value: `${fullYear}.${minor}_${micro}`,
      },
      {
        value: `${fullYear}.${minor}.${micro}`,
        parsed,
      },
      {
        value: `${fullYear}.${looseMinor}.${looseMicro}`,
        formatted: `${fullYear}.${minor}.${micro}`,
        parsed,
      },
    ],
  },
  "YYYY.MICRO": {
    tokens: validFormats["YYYY.MICRO"].tokens,
    tokenValues: { year: fullYear, micro },
    values: [
      { value: `${fullYear}_${micro}` },
      { value: `${fullYear}.${Number.MAX_SAFE_INTEGER}0` },
      {
        value: `${fullYear}.${micro}`,
        parsed,
      },
      {
        value: `${fullYear}.${looseMicro}`,
        parsed,
      },
    ],
  },
  "0Y": {
    tokens: validFormats["0Y"].tokens,
    tokenValues: { year: year },
    values: [
      { value: "1" },
      {
        value: paddedYear,
        parsed,
      },
    ],
  },
  YY: {
    tokens: validFormats.YY.tokens,
    tokenValues: { year: year },
    values: [
      {
        value: "02",
      },
      {
        value: `${year}`,
        parsed,
      },
    ],
  },
  "YY.0W": {
    tokens: validFormats["YY.0W"].tokens,
    tokenValues: { year, week },
    values: [
      {
        value: `${year}.${week}`,
      },
      {
        value: `${year}${paddedWeek}`,
      },
      {
        value: `${year}.00`,
      },
      {
        value: `${year}.54`,
      },
      {
        value: `${year}.${paddedWeek}`,
        parsed,
      },
    ],
  },
  "YY.0M": {
    tokens: validFormats["YY.0M"].tokens,
    tokenValues: { year, month },
    values: [
      {
        value: `${year}.${month}`,
      },
      {
        value: `${year}.13`,
      },
      {
        value: `${year}.${paddedMonth}`,
        parsed,
      },
    ],
  },
  "YYYY.0W": {
    tokens: validFormats["YYYY.0W"].tokens,
    tokenValues: { year: fullYear, week },
    values: [
      {
        value: `${fullYear}.${week}`,
      },
      {
        value: `${fullYear}${paddedWeek}`,
      },
      {
        value: `${fullYear}.00`,
      },
      {
        value: `${fullYear}.54`,
      },
      {
        value: `${fullYear}.${paddedWeek}`,
        parsed,
      },
    ],
  },
  "YYYY.0W.MINOR.MICRO": {
    tokens: validFormats["YYYY.0W.MINOR.MICRO"].tokens,
    tokenValues: { year: fullYear, week, minor, micro },
    values: [
      {
        value: `${fullYear}.${paddedWeek}.${minor}.${micro}`,
        parsed,
      },
    ],
  },
  "YYYY.0W.MICRO": {
    tokens: validFormats["YYYY.0W.MICRO"].tokens,
    tokenValues: { year: fullYear, week, micro },
    values: [
      {
        value: `${fullYear}.${paddedWeek}.${micro}`,
        parsed,
      },
    ],
  },
  YYYY0W: {
    tokens: validFormats.YYYY0W.tokens,
    tokenValues: { year: fullYear, week },
    values: [
      {
        value: `${fullYear}.${week}`,
      },
      {
        value: `${fullYear}${paddedWeek}`,
        parsed,
      },
    ],
  },
  "YYYY.WW": {
    tokens: validFormats["YYYY.WW"].tokens,
    tokenValues: { year: fullYear, week },
    values: [
      {
        value: `${fullYear}.${week}`,
        parsed,
      },
    ],
  },
  "YYYY.0M": {
    tokens: validFormats["YYYY.0M"].tokens,
    tokenValues: { year: fullYear, month },
    values: [
      { value: `${fullYear}.${month}` },
      { value: `${fullYear}.00` },
      { value: `${fullYear}.13` },
      {
        value: `${fullYear}.${paddedMonth}`,
        parsed,
      },
    ],
  },
  "YYYY.0M.MINOR.MICRO": {
    tokens: validFormats["YYYY.0M.MINOR.MICRO"].tokens,
    tokenValues: { year: fullYear, month, minor, micro },
    values: [
      {
        value: `${fullYear}.${paddedMonth}.${minor}.${micro}`,
        parsed,
      },
    ],
  },
  "YYYY.0M.MICRO": {
    tokens: validFormats["YYYY.0M.MICRO"].tokens,
    tokenValues: { year: fullYear, month, micro },
    values: [
      {
        value: `${fullYear}.${paddedMonth}.${micro}`,
        parsed,
      },
    ],
  },
  "YYYY.0M.0D": {
    tokens: validFormats["YYYY.0M.0D"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      { value: `${fullYear}.12345.12345` },
      { value: `.${paddedMonth}.${paddedDay}` },
      { value: `012.${paddedMonth}.${paddedDay}` },
      { value: `${fullYear}.${paddedMonth}.${day}` },
      { value: `${fullYear}.${paddedMonth}.00` },
      { value: `${fullYear}.${paddedMonth}.32` },
      {
        value: `${fullYear}.${paddedMonth}.${paddedDay}`,
        parsed,
      },
    ],
  },
  "YYYY.0M.0D.MINOR.MICRO": {
    tokens: validFormats["YYYY.0M.0D.MINOR.MICRO"].tokens,
    tokenValues: { year: fullYear, month, day, minor, micro },
    values: [
      {
        value: `${fullYear}.${paddedMonth}.${paddedDay}.${minor}.${micro}`,
        parsed,
      },
    ],
  },
  "YYYY.0M.0D.MICRO": {
    tokens: validFormats["YYYY.0M.0D.MICRO"].tokens,
    tokenValues: { year: fullYear, month, day, micro },
    values: [
      {
        value: `${fullYear}.${paddedMonth}.${paddedDay}.${micro}`,
        parsed,
      },
    ],
  },
  "YYYY.0M.DD": {
    tokens: validFormats["YYYY.0M.DD"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}.${paddedMonth}.${paddedDay}`,
      },
      {
        value: `${fullYear}.${paddedMonth}.${day}`,
        parsed,
      },
    ],
  },
  "YYYY.0M0D": {
    tokens: validFormats["YYYY.0M.0D"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}.${paddedMonth}${day}`,
      },
      {
        value: `${fullYear}.${paddedMonth}${paddedDay}`,
        parsed,
      },
    ],
  },
  YYYY0M: {
    tokens: validFormats.YYYY0M.tokens,
    tokenValues: { year: fullYear, month },
    values: [
      {
        value: `${fullYear}${month}`,
      },
      {
        value: `${fullYear}${paddedMonth}`,
        parsed,
      },
    ],
  },
  "YYYY0M.0D": {
    tokens: validFormats["YYYY0M.0D"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}${paddedMonth}.${day}`,
      },
      {
        value: `${fullYear}${paddedMonth}.${paddedDay}`,
        parsed,
      },
    ],
  },
  "YYYY0M.DD": {
    tokens: validFormats["YYYY0M.DD"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}${paddedMonth}.${paddedDay}`,
      },
      {
        value: `${fullYear}${paddedMonth}.${day}`,
        parsed,
      },
    ],
  },
  YYYY0M0D: {
    tokens: validFormats.YYYY0M0D.tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}${paddedMonth}${paddedDay}`,
        parsed,
      },
    ],
  },
  "YYYY.MM": {
    tokens: validFormats["YYYY.MM"].tokens,
    tokenValues: { year: fullYear, month },
    values: [
      {
        value: `${fullYear}.${paddedMonth}`,
      },
      {
        value: `${fullYear}.${month}`,
        parsed,
      },
    ],
  },
  "YYYY.MM.0D": {
    tokens: validFormats["YYYY.MM.0D"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}.${month}.${day}`,
      },
      {
        value: `${fullYear}.${month}.${paddedDay}`,
        parsed,
      },
    ],
  },
  "YYYY.MM.DD": {
    tokens: validFormats["YYYY.MM.DD"].tokens,
    tokenValues: { year: fullYear, month, day },
    values: [
      {
        value: `${fullYear}.${month}.${paddedDay}`,
      },
      {
        value: `${fullYear}.${month}.${day}`,
        parsed,
      },
    ],
  },
};
