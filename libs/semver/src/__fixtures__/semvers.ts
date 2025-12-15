import { VersioningPrereleaseOptions } from "@lets-release/versioning";

import { ParsedSemVer } from "src/types/ParsedSemVer";

export const semvers: {
  value: string;
  prereleaseName?: string;
  options?: VersioningPrereleaseOptions;
  parsed?: ParsedSemVer;
}[] = [
  {
    value: "1.0.0.0",
  },
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
    value: "1.0.0alpha1",
  },
  {
    value: "1.2.3",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.beta",
    prereleaseName: "alpha.beta",
    options: { initialNumber: 0, ignoreZeroNumber: true },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha.beta",
      prereleaseNumber: undefined,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.beta.1",
    prereleaseName: "alpha.beta",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha.beta",
      prereleaseNumber: 1,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.1",
    prereleaseName: "beta",
  },
  {
    value: "1.2.3-alpha.1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha",
      prereleaseNumber: 1,
      build: undefined,
    },
  },
  {
    value: "1.2.3-1",
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: undefined,
      prereleaseNumber: 1,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha.beta",
    options: { initialNumber: 0, ignoreZeroNumber: true },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha.beta",
      prereleaseNumber: undefined,
      build: undefined,
    },
  },
  {
    value: "1.2.3-alpha123+build.metadata",
    options: { initialNumber: 0, ignoreZeroNumber: true },
    parsed: {
      major: 1,
      minor: 2,
      patch: 3,
      prereleaseName: "alpha123",
      prereleaseNumber: undefined,
      build: "build.metadata",
    },
  },
];
