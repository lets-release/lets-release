import { CalVerToken } from "src/enums/CalVerToken";
import { ParsedCalVerFormat } from "src/types/ParsedCalVerFormat";

export const validFormats: Record<string, ParsedCalVerFormat> = {
  YYYY: {
    tokens: {
      year: CalVerToken.YYYY,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})`,
  },
  "YYYY.MINOR.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      minor: CalVerToken.MINOR,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<minor>\d+)\.(?<micro>\d+)`,
  },
  "YYYY.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<micro>\d+)`,
  },
  "0Y": {
    tokens: {
      year: CalVerToken.YY,
    },
    regex: String.raw`(?<year>\d{2,})`,
  },
  YY: {
    tokens: {
      year: CalVerToken.Y,
    },
    regex: String.raw`(?<year>0<?!\d>|[1-9]\d*)`,
  },
  "YYYY.0W": {
    tokens: {
      year: CalVerToken.YYYY,
      week: CalVerToken.WW,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<week>\d{2})`,
  },
  "YYYY.0W.MINOR.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      week: CalVerToken.WW,
      minor: CalVerToken.MINOR,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<week>\d{2})\.(?<minor>\d+)\.(?<micro>\d+)`,
  },
  "YYYY.0W.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      week: CalVerToken.WW,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<week>\d{2})\.(?<micro>\d+)`,
  },
  YYYY0W: {
    tokens: {
      year: CalVerToken.YYYY,
      week: CalVerToken.WW,
    },
    regex: String.raw`(?<year>[1-9]\d{3,}?)(?<week>\d{2})`,
  },
  "YYYY.WW": {
    tokens: {
      year: CalVerToken.YYYY,
      week: CalVerToken.W,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<week>[1-9]\d?)`,
  },
  "YYYY.0M": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})`,
  },
  "YYYY.0M.MINOR.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      minor: CalVerToken.MINOR,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})\.(?<minor>\d+)\.(?<micro>\d+)`,
  },
  "YYYY.0M.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})\.(?<micro>\d+)`,
  },
  "YYYY.0M.0D": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.DD,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})\.(?<day>\d{2})`,
  },
  "YYYY.0M.0D.MINOR.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.DD,
      minor: CalVerToken.MINOR,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})\.(?<day>\d{2})\.(?<minor>\d+)\.(?<micro>\d+)`,
  },
  "YYYY.0M.0D.MICRO": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.DD,
      micro: CalVerToken.MICRO,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})\.(?<day>\d{2})\.(?<micro>\d+)`,
  },
  "YYYY.0M.DD": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.D,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})\.(?<day>[1-9]\d?)`,
  },
  "YYYY.0M0D": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.DD,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>\d{2})(?<day>\d{2})`,
  },
  YYYY0M: {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
    },
    regex: String.raw`(?<year>[1-9]\d{3,}?)(?<month>\d{2})`,
  },
  "YYYY0M.0D": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.DD,
    },
    regex: String.raw`(?<year>[1-9]\d{3,}?)(?<month>\d{2})\.(?<day>\d{2})`,
  },
  "YYYY0M.DD": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.D,
    },
    regex: String.raw`(?<year>[1-9]\d{3,}?)(?<month>\d{2})\.(?<day>[1-9]\d?)`,
  },
  YYYY0M0D: {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.MM,
      day: CalVerToken.DD,
    },
    regex: String.raw`(?<year>[1-9]\d{3,}?)(?<month>\d{2})(?<day>\d{2})`,
  },
  "YYYY.MM": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.M,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>[1-9]\d?)`,
  },
  "YYYY.MM.0D": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.M,
      day: CalVerToken.DD,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>[1-9]\d?)\.(?<day>\d{2})`,
  },
  "YYYY.MM.DD": {
    tokens: {
      year: CalVerToken.YYYY,
      month: CalVerToken.M,
      day: CalVerToken.D,
    },
    regex: String.raw`(?<year>[1-9]\d{3,})\.(?<month>[1-9]\d?)\.(?<day>[1-9]\d?)`,
  },
};

export const invalidFormats = [
  " ",
  ".YYYY.MINOR.MICRO",
  "YYYY.MINOR.MICRO.",
  "YYYY..MINOR.MICRO",
  "YYYY.YY",
  "YYYY.XY",
  "YYYYWW",
  "YYYY.0MDD",
  "YYYY0MDD",
  "YYYY.MM0D",
  "YYYY.MMDD",
  "YYYYMM",
  "YYYYMMDD",
  "YYYYMM0D",
  "MM.DD",
  "YYYY.WW.MM",
  "YYYY.WW.DD",
  "YYYY.DD",
  "YYYY.DD.MM",
  "YYYY.MINOR",
  "YYYY.MICRO.MINOR",
  "YYYY.MINOR.MICRO.WW",
  "YYYY.MINOR.MICRO.MM",
  "YYYY.MINOR.MICRO.DD",
];
