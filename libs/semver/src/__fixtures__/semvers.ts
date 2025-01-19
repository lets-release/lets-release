import { DEFAULT_SEMVER_PRERELEASE_OPTIONS } from "src/constants/DEFAULT_SEMVER_PRERELEASE_OPTIONS";
import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";
import { ParsedSemVer } from "src/types/ParsedSemVer";

export const semvers: {
  value: string;
  options?: SemVerPrereleaseOptions;
  parsed?: ParsedSemVer;
}[] = [
  {
    value: `${Number.MAX_SAFE_INTEGER}0.0.0`,
  },
  {
    value: `0.${Number.MAX_SAFE_INTEGER}0.0`,
  },
  {
    value: `0.0.${Number.MAX_SAFE_INTEGER}0`,
  },
  {
    value: "1.0.0.0",
  },
  {
    value: "hello, world",
  },
  {
    value: "xyz",
  },
  {
    value: "1.2.3",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseOptions: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
      build: undefined,
    },
  },
  {
    value: "1.2.3-0",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "",
      prereleaseNumber: 0,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-2.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "2",
      prereleaseNumber: 1,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha",
    options: { initialNumber: 0 },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: undefined,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        initialNumber: 0,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha",
    options: { prefix: "", initialNumber: 0 },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "-alpha",
      prereleaseNumber: undefined,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        prefix: "",
        initialNumber: 0,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.0",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 0,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 1,
      prereleaseOptions: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.0.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha.0",
      prereleaseNumber: 1,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha0",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 0,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        initialNumber: 0,
        ignoreZeroNumber: false,
        suffix: "",
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha0",
    options: { suffix: ".", initialNumber: 0 },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha0",
      prereleaseNumber: undefined,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        initialNumber: 0,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha0.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha0",
      prereleaseNumber: 1,
      prereleaseOptions: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha0.1",
    options: { suffix: "." },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha0",
      prereleaseNumber: 1,
      prereleaseOptions: DEFAULT_SEMVER_PRERELEASE_OPTIONS,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha0.1.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha0.1",
      prereleaseNumber: 1,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3alpha",
    options: { initialNumber: 0 },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: undefined,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        prefix: "",
        initialNumber: 0,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3alpha.0",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 0,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        prefix: "",
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3alpha.0.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha.0",
      prereleaseNumber: 1,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        prefix: "",
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3alpha0",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 0,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        prefix: "",
        suffix: "",
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3alpha0.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha0",
      prereleaseNumber: 1,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        prefix: "",
        ignoreZeroNumber: true,
      },
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha123+build.metadata",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 123,
      prereleaseOptions: {
        ...DEFAULT_SEMVER_PRERELEASE_OPTIONS,
        suffix: "",
      },
      build: "build.metadata",
    },
  },
];
