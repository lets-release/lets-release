import { formatDate } from "date-fns";

import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

const fullYear = new Date().getFullYear();
const date = new Date();
const week = Number(formatDate(date, "I"));
const paddedWeek = week.toString().padStart(2, "0");
const month = Number(formatDate(date, "M"));
const paddedMonth = month.toString().padStart(2, "0");
const day = Number(formatDate(date, "d"));
const paddedDay = day.toString().padStart(2, "0");

export const increments: Record<
  string,
  Partial<
    Record<
      | "major"
      | "minor"
      | "micro"
      | "build"
      | "major-prerelease"
      | "minor-prerelease"
      | "micro-prerelease"
      | "prerelease",
      {
        current: string;
        next?: string;
        options?: CalVerPrereleaseOptions & {
          prereleaseName?: string;
          build?: string;
          majorIncrement?: number;
        };
      }[]
    >
  >
> = {
  YYYY: {
    major: [
      {
        current: "2001-0",
        next: "2001",
      },
      {
        current: "2001-alpha",
        next: "2001",
      },
      {
        current: "2001",
        next: "2003",
        options: {
          majorIncrement: 2,
        },
      },
      {
        current: "2001",
        next: `${fullYear}`,
      },
      {
        current: "2001+build",
        next: `${fullYear}`,
      },
      {
        current: "2001+build",
        next: `${fullYear}+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}`,
      },
    ],
    minor: [
      {
        current: "2001",
      },
    ],
    micro: [
      {
        current: "2001",
      },
    ],
    build: [
      {
        current: `${fullYear}`,
        next: `${fullYear}+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "major-prerelease": [
      {
        current: "2001-0",
        next: "2004-0",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001-1",
        next: "2004-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001-alpha",
        next: "2004-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001-alpha",
        next: "2004-0",
        options: {
          majorIncrement: 3,
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },

      {
        current: "2001-alpha",
        next: "2004-beta",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001-alpha",
        next: "2004-beta.0",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001-alpha",
        next: "2004-beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
        },
      },
      {
        current: "2001-alpha",
        next: "2004beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001-alpha",
        next: "2004-beta1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001-alpha",
        next: "2004-1.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001",
        next: "2004-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: `${fullYear}`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001",
      },
    ],
    "micro-prerelease": [
      {
        current: "2001",
      },
    ],
    prerelease: [
      {
        current: "2001-0",
        next: "2001-1",
      },
      {
        current: "2001-1",
        next: "2001-2",
        options: {
          prefix: "",
        },
      },
      {
        current: "2001-alpha",
        next: "2001-alpha.0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001-alpha",
        next: "2001-alpha.1",
      },
      {
        current: "2001-alpha.0",
        next: "2001-alpha.1",
      },
      {
        current: "2001-alpha.3",
        next: "2001-alpha.4",
      },
      {
        current: "2001-alpha.0",
        next: "2001-0",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001-alpha.1",
        next: "2001-1",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001-alpha.0",
        next: "2001-beta.0",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001-alpha.0",
        next: "2001-beta",
        options: {
          prereleaseName: "beta",
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001-alpha.1",
        next: "2001-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001-alpha.1",
        next: "2001-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001",
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}`,
      },
    ],
  },
  "YYYY.MINOR.MICRO": {
    major: [
      {
        current: "2001.0.0-0",
        next: "2001.0.0",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.0",
      },
      {
        current: "2001.0.0",
        next: "2003.0.0",
        options: {
          majorIncrement: 2,
        },
      },
      {
        current: "2001.2.3",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.0.0+build",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.0.0+build",
        next: `${fullYear}.0.0+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}.0.0`,
      },
    ],
    minor: [
      {
        current: "2001.0.0-0",
        next: "2001.0.0",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.0",
      },
      {
        current: "2001.0.0",
        next: "2001.1.0",
      },
      {
        current: "2001.1.0-alpha",
        next: "2001.1.0",
      },
      {
        current: "2001.1.1-alpha",
        next: "2001.2.0",
      },
      {
        current: "2001.2.3",
        next: "2001.3.0",
      },
      {
        current: "2001.2.3+build",
        next: "2001.3.0",
      },
      {
        current: "2001.2.3+build",
        next: "2001.3.0+new-build",
        options: {
          build: "new-build",
        },
      },
    ],
    micro: [
      {
        current: "2001.0.0-0",
        next: "2001.0.0",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.0",
      },
      {
        current: "2001.2.3-alpha",
        next: "2001.2.3",
      },
      {
        current: "2001.2.3",
        next: "2001.2.4",
      },
      {
        current: "2001.2.3+build",
        next: "2001.2.4",
      },
      {
        current: "2001.2.3+build",
        next: "2001.2.4+new-build",
        options: {
          build: "new-build",
        },
      },
    ],
    build: [
      {
        current: `${fullYear}.2.3`,
        next: `${fullYear}.2.3+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "major-prerelease": [
      {
        current: "2001.0.0-0",
        next: "2004.0.0-0",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.0.0-1",
        next: "2004.0.0-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.1.2-alpha",
        next: "2004.0.0-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.4.5-alpha",
        next: "2004.0.0-0",
        options: {
          majorIncrement: 3,
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },
      {
        current: "2001.6.7-alpha",
        next: "2004.0.0-beta",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.1.2-alpha",
        next: "2004.0.0-beta.0",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0.1-alpha",
        next: "2004.0.0-beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.1.0-alpha",
        next: "2004.0.0beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.2.2-alpha",
        next: "2004.0.0-beta1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.1.1-alpha",
        next: "2004.0.0-1.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.1.1",
        next: "2004.0.0-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: `${fullYear}.0.0`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.0.0-0",
        next: "2001.1.0-0",
      },
      {
        current: "2001.0.0-1",
        next: "2001.1.0-1",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-1",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-beta.0",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0beta.1",
        options: {
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-beta1",
        options: {
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.1.0-1.1",
        options: {
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.0.0",
        next: "2001.1.0-1",
      },
    ],
    "micro-prerelease": [
      {
        current: "2001.0.0-0",
        next: "2001.0.1-0",
      },
      {
        current: "2001.0.0-1",
        next: "2001.0.1-1",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-1",
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-beta.0",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1beta.1",
        options: {
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-beta1",
        options: {
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: "2001.0.1-1.1",
        options: {
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.0.0",
        next: "2001.0.1-1",
      },
    ],
    prerelease: [
      {
        current: "2001.1.2-0",
        next: "2001.1.2-1",
      },
      {
        current: "2001.1.2-1",
        next: "2001.1.2-2",
        options: {
          prefix: "",
        },
      },
      {
        current: "2001.1.2-alpha",
        next: "2001.1.2-alpha.0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.1.2-alpha",
        next: "2001.1.2-alpha.1",
      },
      {
        current: "2001.1.2-alpha.0",
        next: "2001.1.2-alpha.1",
      },
      {
        current: "2001.1.2-alpha.3",
        next: "2001.1.2-alpha.4",
      },
      {
        current: "2001.1.2-alpha.0",
        next: "2001.1.2-0",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.1.2-alpha.1",
        next: "2001.1.2-1",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.1.2-alpha.0",
        next: "2001.1.2-beta.0",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.1.2-alpha.0",
        next: "2001.1.2-beta",
        options: {
          prereleaseName: "beta",
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.1.2-alpha.1",
        next: "2001.1.2-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.1.2-alpha.1",
        next: "2001.1.2-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.1.2",
        next: `2001.1.3-1`,
      },
    ],
  },
  "YYYY.MICRO": {
    major: [
      {
        current: "2001.0-0",
        next: "2001.0",
      },
      {
        current: "2001.0-alpha",
        next: "2001.0",
      },
      {
        current: "2001.0",
        next: "2003.0",
        options: {
          majorIncrement: 2,
        },
      },
      {
        current: "2001.3",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.0+build",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.0+build",
        next: `${fullYear}.0+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}.0`,
      },
    ],
    minor: [
      {
        current: "2001.0",
      },
    ],
    micro: [
      {
        current: "2001.0-0",
        next: "2001.0",
      },
      {
        current: "2001.0-alpha",
        next: "2001.0",
      },
      {
        current: "2001.3-alpha",
        next: "2001.3",
      },
      {
        current: "2001.3",
        next: "2001.4",
      },
      {
        current: "2001.3+build",
        next: "2001.4",
      },
      {
        current: "2001.3+build",
        next: "2001.4+new-build",
        options: {
          build: "new-build",
        },
      },
    ],
    build: [
      {
        current: `${fullYear}.3`,
        next: `${fullYear}.3+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "major-prerelease": [
      {
        current: "2001.0-0",
        next: "2004.0-0",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.0-1",
        next: "2004.0-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.2-alpha",
        next: "2004.0-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.5-alpha",
        next: "2004.0-0",
        options: {
          majorIncrement: 3,
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },
      {
        current: "2001.7-alpha",
        next: "2004.0-beta",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.2-alpha",
        next: "2004.0-beta.0",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.1-alpha",
        next: "2004.0-beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.0-alpha",
        next: "2004.0beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.2-alpha",
        next: "2004.0-beta1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.1-alpha",
        next: "2004.0-1.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.1",
        next: "2004.0-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: `${fullYear}.0`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.0-0",
      },
    ],
    "micro-prerelease": [
      {
        current: "2001.0-0",
        next: "2001.1-0",
      },
      {
        current: "2001.0-1",
        next: "2001.1-1",
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-1",
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-beta.0",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.0-alpha",
        next: "2001.1beta.1",
        options: {
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-beta1",
        options: {
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.0-alpha",
        next: "2001.1-1.1",
        options: {
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.0",
        next: "2001.1-1",
      },
    ],
    prerelease: [
      {
        current: "2001.2-0",
        next: "2001.2-1",
      },
      {
        current: "2001.2-1",
        next: "2001.2-2",
        options: {
          prefix: "",
        },
      },
      {
        current: "2001.2-alpha",
        next: "2001.2-alpha.0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.2-alpha",
        next: "2001.2-alpha.1",
      },
      {
        current: "2001.2-alpha.0",
        next: "2001.2-alpha.1",
      },
      {
        current: "2001.2-alpha.3",
        next: "2001.2-alpha.4",
      },
      {
        current: "2001.2-alpha.0",
        next: "2001.2-0",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.2-alpha.1",
        next: "2001.2-1",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.2-alpha.0",
        next: "2001.2-beta.0",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.2-alpha.0",
        next: "2001.2-beta",
        options: {
          prereleaseName: "beta",
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.2-alpha.1",
        next: "2001.2-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.2-alpha.1",
        next: "2001.2-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.2",
        next: `2001.3-1`,
      },
    ],
  },
  "YYYY.0W": {
    major: [
      {
        current: "2001.11-0",
        next: "2001.11",
      },
      {
        current: "2001.12-alpha",
        next: "2001.12",
      },
      {
        current: "2001.12",
        next: "2001.14",
        options: {
          majorIncrement: 2,
        },
      },
      {
        current: "2001.12",
        next: `${fullYear}.${paddedWeek}`,
      },
      {
        current: "2001.12+build",
        next: `${fullYear}.${paddedWeek}`,
      },
      {
        current: "2001.12+build",
        next: `${fullYear}.${paddedWeek}+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}.${paddedWeek}`,
      },
    ],
    minor: [
      {
        current: "2001.12",
      },
    ],
    micro: [
      {
        current: "2001.12",
      },
    ],
    build: [
      {
        current: `${fullYear}.${paddedWeek}`,
        next: `${fullYear}.${paddedWeek}+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "major-prerelease": [
      {
        current: "2001.12-0",
        next: "2001.15-0",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.12-1",
        next: "2001.15-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15-0",
        options: {
          majorIncrement: 3,
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },

      {
        current: "2001.12-alpha",
        next: "2001.15-beta",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15-beta.0",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15-beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15-beta1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.15-1.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.12",
        next: "2001.15-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: `${fullYear}${paddedWeek}`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.12",
      },
    ],
    "micro-prerelease": [
      {
        current: "2001.12",
      },
    ],
    prerelease: [
      {
        current: "2001.12-0",
        next: "2001.12-1",
      },
      {
        current: "2001.12-1",
        next: "2001.12-2",
        options: {
          prefix: "",
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.12-alpha.0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.12-alpha.1",
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-alpha.1",
      },
      {
        current: "2001.12-alpha.3",
        next: "2001.12-alpha.4",
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-0",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.12-alpha.1",
        next: "2001.12-1",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-beta.0",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-beta",
        options: {
          prereleaseName: "beta",
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.12-alpha.1",
        next: "2001.12-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.12-alpha.1",
        next: "2001.12-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.12",
        next: `${fullYear}.${paddedWeek}-1`,
      },
      {
        current: `${fullYear}.${paddedWeek}`,
      },
    ],
  },
  YYYY0W: {
    major: [
      {
        current: "200111-0",
        next: "200111",
      },
    ],
  },
  "YYYY.0M": {
    major: [
      {
        current: "2001.11-0",
        next: "2001.11",
      },
      {
        current: "2001.12-alpha",
        next: "2001.12",
      },
      {
        current: "2001.02",
        next: "2001.04",
        options: {
          majorIncrement: 2,
        },
      },
      {
        current: "2001.12",
        next: `${fullYear}.${paddedMonth}`,
      },
      {
        current: "2001.12+build",
        next: `${fullYear}.${paddedMonth}`,
      },
      {
        current: "2001.12+build",
        next: `${fullYear}.${paddedMonth}+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}.${paddedMonth}`,
      },
    ],
    minor: [
      {
        current: "2001.12",
      },
    ],
    micro: [
      {
        current: "2001.12",
      },
    ],
    build: [
      {
        current: `${fullYear}.${paddedMonth}`,
        next: `${fullYear}.${paddedMonth}+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "major-prerelease": [
      {
        current: "2001.02-0",
        next: "2001.05-0",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.02-1",
        next: "2001.05-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05-0",
        options: {
          majorIncrement: 3,
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },

      {
        current: "2001.02-alpha",
        next: "2001.05-beta",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05-beta.0",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05-beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05-beta1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.02-alpha",
        next: "2001.05-1.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.02",
        next: "2001.05-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: `${fullYear}${paddedMonth}`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.12",
      },
    ],
    "micro-prerelease": [
      {
        current: "2001.12",
      },
    ],
    prerelease: [
      {
        current: "2001.12-0",
        next: "2001.12-1",
      },
      {
        current: "2001.12-1",
        next: "2001.12-2",
        options: {
          prefix: "",
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.12-alpha.0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.12-alpha",
        next: "2001.12-alpha.1",
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-alpha.1",
      },
      {
        current: "2001.12-alpha.3",
        next: "2001.12-alpha.4",
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-0",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.12-alpha.1",
        next: "2001.12-1",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-beta.0",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.12-alpha.0",
        next: "2001.12-beta",
        options: {
          prereleaseName: "beta",
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.12-alpha.1",
        next: "2001.12-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.12-alpha.1",
        next: "2001.12-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.12",
        next: `${fullYear}.${paddedMonth}-1`,
      },
      {
        current: `${fullYear}.${paddedMonth}`,
      },
    ],
  },
  "YYYY.0M.0D": {
    major: [
      {
        current: "2001.11.11-0",
        next: "2001.11.11",
      },
      {
        current: "2001.11.12-alpha",
        next: "2001.11.12",
      },
      {
        current: "2001.11.02",
        next: "2001.11.04",
        options: {
          majorIncrement: 2,
        },
      },
      {
        current: "2001.11.12",
        next: `${fullYear}.${paddedMonth}.${paddedDay}`,
      },
      {
        current: "2001.11.12+build",
        next: `${fullYear}.${paddedMonth}.${paddedDay}`,
      },
      {
        current: "2001.11.12+build",
        next: `${fullYear}.${paddedMonth}.${paddedDay}+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}.${paddedMonth}.${paddedDay}`,
      },
    ],
    minor: [
      {
        current: "2001.11.12",
      },
    ],
    micro: [
      {
        current: "2001.11.12",
      },
    ],
    build: [
      {
        current: `${fullYear}.${paddedMonth}.${paddedDay}`,
        next: `${fullYear}.${paddedMonth}.${paddedDay}+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "major-prerelease": [
      {
        current: "2001.11.02-0",
        next: "2001.11.05-0",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.11.02-1",
        next: "2001.11.05-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-0",
        options: {
          majorIncrement: 3,
          initialNumber: 0,
          ignoreZeroNumber: false,
          prefix: "",
        },
      },

      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-beta",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-beta.0",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05beta.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          prefix: "",
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-beta1",
        options: {
          majorIncrement: 3,
          prereleaseName: "beta",
          suffix: "",
        },
      },
      {
        current: "2001.11.02-alpha",
        next: "2001.11.05-1.1",
        options: {
          majorIncrement: 3,
          prereleaseName: "1",
          suffix: "",
        },
      },
      {
        current: "2001.11.02",
        next: "2001.11.05-1",
        options: {
          majorIncrement: 3,
        },
      },
      {
        current: `${fullYear}${paddedMonth}.${paddedDay}`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.11.12",
      },
    ],
    "micro-prerelease": [
      {
        current: "2001.11.12",
      },
    ],
    prerelease: [
      {
        current: "2001.11.12-0",
        next: "2001.11.12-1",
      },
      {
        current: "2001.11.12-1",
        next: "2001.11.12-2",
        options: {
          prefix: "",
        },
      },
      {
        current: "2001.11.12-alpha",
        next: "2001.11.12-alpha.0",
        options: {
          initialNumber: 0,
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.11.12-alpha",
        next: "2001.11.12-alpha.1",
      },
      {
        current: "2001.11.12-alpha.0",
        next: "2001.11.12-alpha.1",
      },
      {
        current: "2001.11.12-alpha.3",
        next: "2001.11.12-alpha.4",
      },
      {
        current: "2001.11.12-alpha.0",
        next: "2001.11.12-0",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.11.12-alpha.1",
        next: "2001.11.12-1",
        options: {
          prereleaseName: "",
        },
      },
      {
        current: "2001.11.12-alpha.0",
        next: "2001.11.12-beta.0",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.11.12-alpha.0",
        next: "2001.11.12-beta",
        options: {
          prereleaseName: "beta",
          ignoreZeroNumber: true,
        },
      },
      {
        current: "2001.11.12-alpha.1",
        next: "2001.11.12-beta",
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.11.12-alpha.1",
        next: "2001.11.12-beta.1",
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.11.12",
        next: `${fullYear}.${paddedMonth}.${paddedDay}-1`,
      },
      {
        current: `${fullYear}.${paddedMonth}.${paddedDay}`,
      },
    ],
  },
};
