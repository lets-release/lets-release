import { VersioningPrereleaseOptions } from "@lets-release/versioning";

const fullYear = new Date().getFullYear();

export const increments: Record<
  string,
  Partial<
    Record<
      | "major"
      | "minor"
      | "patch"
      | "major:maintenance"
      | "minor:maintenance"
      | "patch:maintenance"
      | "build"
      | "major-prerelease"
      | "minor-prerelease"
      | "patch-prerelease"
      | "prerelease"
      | "major-prerelease:maintenance"
      | "minor-prerelease:maintenance"
      | "patch-prerelease:maintenance"
      | "prerelease:maintenance",
      {
        current: string;
        next?: string;
        options?: VersioningPrereleaseOptions & {
          prereleaseName?: string;
          build?: string;
        };
      }[]
    >
  >
> = {
  YYYY: {
    major: [
      {
        current: `${fullYear}-0`,
        next: `${fullYear}`,
      },
      {
        current: `${fullYear}-alpha`,
        next: `${fullYear}`,
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
      {
        current: `${fullYear + 2}`,
      },
    ],
    "major:maintenance": [
      {
        current: `${fullYear}-0`,
        next: `${fullYear}`,
      },
      {
        current: `2001-0`,
        next: `2001`,
      },
      {
        current: "2001",
      },
      {
        current: `${fullYear}`,
      },
    ],
    "major-prerelease": [
      {
        current: `${fullYear}-0`,
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}-alpha`,
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}-alpha`,
        next: `${fullYear}-1.1`,
        options: {
          prereleaseName: "1",
        },
      },
      {
        current: `${fullYear}-alpha`,
        next: `${fullYear}-alpha.1`,
        options: {
          prereleaseName: "alpha",
        },
      },
      {
        current: `${fullYear}`,
      },
    ],
    "major-prerelease:maintenance": [
      {
        current: `${fullYear}-0`,
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}-alpha`,
        next: `${fullYear}-1`,
      },
      {
        current: `2001-0`,
        next: `2001-1`,
      },
      {
        current: `2001-alpha`,
        next: `2001-1`,
      },
      {
        current: `${fullYear}`,
      },
    ],
    minor: [
      {
        current: "2001",
        next: `${fullYear}`,
      },
      {
        current: "2001-1",
        next: `${fullYear}`,
      },
      {
        current: `${fullYear}`,
      },
    ],
    "minor:maintenance": [
      {
        current: "2001",
      },
    ],
    "minor-prerelease": [
      {
        current: "2001",
        next: `${fullYear}-1`,
      },
      {
        current: "2001",
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}`,
      },
    ],
    "minor-prerelease:maintenance": [
      {
        current: `2001-0`,
        next: `2001-1`,
      },
      {
        current: "2001",
      },
      {
        current: `${fullYear}`,
      },
    ],
    patch: [
      {
        current: "2001",
        next: `${fullYear}`,
      },
      {
        current: "2001-1",
        next: `${fullYear}`,
      },
      {
        current: `${fullYear}`,
      },
    ],
    "patch:maintenance": [
      {
        current: `2001-0`,
        next: `2001`,
      },
      {
        current: "2001",
      },
      {
        current: `${fullYear}`,
      },
    ],
    "patch-prerelease": [
      {
        current: `2001-0`,
        next: `${fullYear}-1`,
      },
      {
        current: "2001",
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}`,
      },
    ],
    "patch-prerelease:maintenance": [
      {
        current: `2001-0`,
        next: `2001-1`,
      },
      {
        current: "2001",
      },
      {
        current: `${fullYear}`,
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
      {
        current: `2001+build`,
        next: `2001+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    prerelease: [
      {
        current: "2001-0",
        next: `${fullYear}-1`,
      },
      {
        current: "2001-1",
        next: `${fullYear}-1`,
      },
      {
        current: "2001-alpha",
        next: `${fullYear}-0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001-alpha",
        next: `${fullYear}-1`,
      },
      {
        current: `${fullYear}-alpha`,
        next: `${fullYear}-alpha.1`,
        options: {
          prereleaseName: "alpha",
        },
      },
      {
        current: `${fullYear}-alpha.0`,
        next: `${fullYear}-alpha.1`,
      },
      {
        current: `${fullYear}-alpha.3`,
        next: `${fullYear}-alpha.4`,
      },
      {
        current: `${fullYear}-alpha.0`,
        next: `${fullYear}-1`,
        options: {
          prereleaseName: "",
        },
      },
      {
        current: `${fullYear}-alpha.1`,
        next: `${fullYear}-1`,
        options: {
          prereleaseName: "",
        },
      },
      {
        current: `${fullYear}-alpha.0`,
        next: `${fullYear}-beta.0`,
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: `${fullYear}-alpha.0`,
        next: `${fullYear}-beta.1`,
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: `${fullYear}-alpha.1`,
        next: `${fullYear}-beta`,
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: `${fullYear}-alpha.1`,
        next: `${fullYear}-beta.1`,
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
    "prerelease:maintenance": [
      {
        current: "2001",
      },
      {
        current: "2001-0",
        next: `2001-1`,
      },
      {
        current: "2001-alpha",
        next: `2001-alpha.0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
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
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0`,
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
        next: `${fullYear}.1.0`,
      },
    ],
    "major:maintenance": [
      {
        current: "2001.0.0-0",
        next: `2001.0.0`,
      },
      {
        current: "2001.0.0",
        next: `2001.1.0`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.1.0`,
      },
    ],
    "major-prerelease": [
      {
        current: "2001.0.0-0",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: `2001.0.0`,
        next: `${fullYear}.0.0-1`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.1.0-1`,
      },
    ],
    "major-prerelease:maintenance": [
      {
        current: "2001.0.0-0",
        next: `2001.1.0-1`,
      },
      {
        current: `2001.0.0`,
        next: `2001.1.0-1`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.1.0-1`,
      },
    ],
    minor: [
      {
        current: "2001.0.0-0",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.0.0",
        next: `${fullYear}.0.0`,
      },
      {
        current: `${fullYear}.1.0`,
        next: `${fullYear}.2.0`,
      },
    ],
    "minor:maintenance": [
      {
        current: "2001.0.0-0",
        next: `2001.0.0`,
      },
      {
        current: "2001.0.0-alpha",
        next: `2001.0.0`,
      },
      {
        current: "2001.0.0",
        next: `2001.1.0`,
      },
      {
        current: `${fullYear}.1.0`,
        next: `${fullYear}.2.0`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.0.0-0",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.0.0-1",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-beta`,
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-beta.0`,
        options: {
          prereleaseName: "beta",
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-beta.1`,
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-1.1`,
        options: {
          prereleaseName: "1",
        },
      },
      {
        current: "2001.0.0",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.1.0-1`,
      },
    ],
    "minor-prerelease:maintenance": [
      {
        current: "2001.0.0-1",
        next: `2001.1.0-1`,
      },
      {
        current: "2001.0.0-alpha",
        next: `2001.1.0-1`,
      },
      {
        current: "2001.0.0",
        next: `2001.1.0-1`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.1.0-1`,
      },
    ],
    patch: [
      {
        current: "2001.0.0-0",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.2.3-alpha",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.2.3",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.2.3+build",
        next: `${fullYear}.0.0`,
      },
      {
        current: "2001.2.3+build",
        next: `${fullYear}.0.0+new-build`,
        options: {
          build: "new-build",
        },
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.0.1`,
      },
    ],
    "patch:maintenance": [
      {
        current: "2001.0.0-0",
        next: `2001.0.0`,
      },
      {
        current: "2001.0.0-alpha",
        next: `2001.0.0`,
      },
      {
        current: "2001.2.3-alpha",
        next: `2001.2.3`,
      },
      {
        current: "2001.2.3",
        next: `2001.2.4`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.0.1`,
      },
    ],
    "patch-prerelease": [
      {
        current: "2001.0.0-0",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.0.0-1",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.0.0-alpha",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.0.0",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.0.1-1`,
      },
    ],
    "patch-prerelease:maintenance": [
      {
        current: "2001.0.0-0",
        next: `2001.0.1-1`,
      },
      {
        current: "2001.0.0-1",
        next: `2001.0.1-1`,
      },
      {
        current: "2001.0.0-alpha",
        next: `2001.0.1-1`,
      },
      {
        current: "2001.0.0",
        next: `2001.0.1-1`,
      },
      {
        current: `${fullYear}.0.0`,
        next: `${fullYear}.0.1-1`,
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
    prerelease: [
      {
        current: "2001.1.2-0",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.1.2-alpha",
        next: `${fullYear}.0.0-0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.1.2-alpha",
        next: `${fullYear}.0.0-1`,
      },
      {
        current: "2001.1.2-alpha.0",
        next: `${fullYear}.0.0-beta.1`,
        options: {
          prereleaseName: "beta",
        },
      },
      {
        current: "2001.1.2",
        next: `${fullYear}.0.0-1`,
      },
    ],
    "prerelease:maintenance": [
      {
        current: "2001.1.2-0",
        next: `2001.1.2-1`,
      },
      {
        current: "2001.1.2-alpha",
        next: `2001.1.2-alpha.0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.1.2-alpha",
        next: `2001.1.2-alpha.1`,
      },
      {
        current: "2001.1.2-alpha.0",
        next: `2001.1.2-beta.1`,
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
        next: `${fullYear}.0`,
      },
      {
        current: "2001.0-alpha",
        next: `${fullYear}.0`,
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
        next: `${fullYear}.1`,
      },
    ],
    "major:maintenance": [
      {
        current: "2001.0-0",
        next: `2001.0`,
      },
      {
        current: "2001.0-alpha",
        next: `2001.0`,
      },
      {
        current: "2001.3",
        next: `2001.4`,
      },
      {
        current: `${fullYear}.0`,
        next: `${fullYear}.1`,
      },
    ],
    "major-prerelease": [
      {
        current: "2001.0-0",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.0",
        next: `${fullYear}.0-1`,
      },
      {
        current: `${fullYear}.0`,
        next: `${fullYear}.1-1`,
      },
    ],
    "major-prerelease:maintenance": [
      {
        current: "2001.0-0",
        next: `2001.1-1`,
      },
      {
        current: "2001.0",
        next: `2001.1-1`,
      },
      {
        current: `${fullYear}.0`,
        next: `${fullYear}.1-1`,
      },
    ],
    minor: [
      {
        current: "2001.0-0",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.0-alpha",
        next: `${fullYear}.0`,
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
        next: `${fullYear}.1`,
      },
    ],
    "minor:maintenance": [
      {
        current: "2001.0-0",
        next: `2001.0`,
      },
      {
        current: "2001.0-alpha",
        next: `2001.0`,
      },
      {
        current: "2001.3",
        next: `2001.4`,
      },
      {
        current: `${fullYear}.0`,
        next: `${fullYear}.1`,
      },
    ],
    "minor-prerelease": [
      {
        current: "2001.0-0",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.0",
        next: `${fullYear}.0-1`,
      },
      {
        current: `${fullYear}.0`,
        next: `${fullYear}.1-1`,
      },
    ],
    "minor-prerelease:maintenance": [
      {
        current: "2001.0-0",
        next: `2001.1-1`,
      },
      {
        current: "2001.0",
        next: `2001.1-1`,
      },
      {
        current: `${fullYear}.0`,
        next: `${fullYear}.1-1`,
      },
    ],
    patch: [
      {
        current: "2001.0-0",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.0-alpha",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.3-alpha",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.3",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.3+build",
        next: `${fullYear}.0`,
      },
      {
        current: "2001.3+build",
        next: `${fullYear}.0+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "patch:maintenance": [
      {
        current: "2001.0-0",
        next: `2001.0`,
      },
      {
        current: "2001.0-alpha",
        next: `2001.0`,
      },
      {
        current: "2001.3-alpha",
        next: `2001.3`,
      },
      {
        current: "2001.3",
        next: `2001.4`,
      },
      {
        current: "2001.3+build",
        next: `2001.4`,
      },
      {
        current: "2001.3+build",
        next: `2001.4+new-build`,
        options: {
          build: "new-build",
        },
      },
    ],
    "patch-prerelease": [
      {
        current: "2001.0-0",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.0-1",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.0-alpha",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.0-alpha",
        next: `${fullYear}.0-0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0",
        next: `${fullYear}.0-1`,
      },
    ],
    "patch-prerelease:maintenance": [
      {
        current: "2001.0-0",
        next: `2001.1-1`,
      },
      {
        current: "2001.0-1",
        next: `2001.1-1`,
      },
      {
        current: "2001.0-alpha",
        next: `2001.1-1`,
      },
      {
        current: "2001.0-alpha",
        next: `2001.1-0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.0",
        next: `2001.1-1`,
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
    prerelease: [
      {
        current: "2001.2-0",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.2-1",
        next: `${fullYear}.0-1`,
      },
      {
        current: "2001.2-alpha",
        next: `${fullYear}.0-0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.2",
        next: `${fullYear}.0-1`,
      },
    ],
    "prerelease:maintenance": [
      {
        current: "2001.2-0",
        next: `2001.2-1`,
      },
      {
        current: "2001.2-1",
        next: `2001.2-2`,
      },
      {
        current: "2001.2-alpha",
        next: `2001.2-alpha.0`,
        options: {
          initialNumber: 0,
          ignoreZeroNumber: false,
        },
      },
      {
        current: "2001.2",
        next: `2001.3-1`,
      },
    ],
  },
};
