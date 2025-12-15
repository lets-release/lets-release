import { VersioningPrereleaseOptions } from "@lets-release/versioning";

export const increments: Record<
  | "major"
  | "minor"
  | "patch"
  | "build"
  | "major-prerelease"
  | "minor-prerelease"
  | "patch-prerelease"
  | "prerelease",
  {
    current: string;
    next: string;
    options?: VersioningPrereleaseOptions & {
      prereleaseName?: string;
      build?: string;
    };
  }[]
> = {
  major: [
    {
      current: "1.0.2-alpha",
      next: "2.0.0",
    },
    {
      current: "1.2.0-alpha",
      next: "2.0.0",
    },
    {
      current: "1.2.3",
      next: "2.0.0",
    },
    {
      current: "1.0.0",
      next: "2.0.0",
    },
    {
      current: "1.0.0-0",
      next: "1.0.0",
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.0",
    },
    {
      current: "1.2.3+build",
      next: "2.0.0+new-build",
      options: {
        build: "new-build",
      },
    },
  ],
  "major-prerelease": [
    {
      current: "1.0.0-0",
      next: "2.0.0-1",
    },
    {
      current: "1.0.0-alpha",
      next: "2.0.0-1",
    },
    {
      current: "1.0.0-alpha",
      next: "2.0.0-0",
      options: {
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "2.0.0-beta",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "2.0.0-beta.0",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "2.0.0-beta.1",
      options: {
        prereleaseName: "beta",
      },
    },
    {
      current: "1.0.0",
      next: "2.0.0-1",
    },
  ],
  minor: [
    {
      current: "1.0.0-0",
      next: "1.0.0",
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.0",
    },
    {
      current: "1.0.0",
      next: "1.1.0",
    },
    {
      current: "1.1.0-alpha",
      next: "1.1.0",
    },
    {
      current: "1.1.1-alpha",
      next: "1.2.0",
    },
    {
      current: "1.2.3",
      next: "1.3.0",
    },
    {
      current: "1.2.3+build",
      next: "1.3.0",
    },
    {
      current: "1.2.3+build",
      next: "1.3.0+new-build",
      options: {
        build: "new-build",
      },
    },
  ],
  "minor-prerelease": [
    {
      current: "1.0.0-0",
      next: "1.1.0-1",
    },
    {
      current: "1.0.0-1",
      next: "1.1.0-1",
    },
    {
      current: "1.0.0-alpha",
      next: "1.1.0-1",
    },
    {
      current: "1.0.0-alpha",
      next: "1.1.0-0",
      options: {
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.1.0-beta",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.1.0-beta.0",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.1.0-beta.1",
      options: {
        prereleaseName: "beta",
      },
    },
    {
      current: "1.0.0",
      next: "1.1.0-1",
    },
  ],
  patch: [
    {
      current: "1.0.0-0",
      next: "1.0.0",
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.0",
    },
    {
      current: "1.2.3-alpha",
      next: "1.2.3",
    },
    {
      current: "1.2.3",
      next: "1.2.4",
    },
    {
      current: "1.2.3+build",
      next: "1.2.4",
    },
    {
      current: "1.2.3+build",
      next: "1.2.4+new-build",
      options: {
        build: "new-build",
      },
    },
  ],
  "patch-prerelease": [
    {
      current: "1.0.0-0",
      next: "1.0.1-1",
    },
    {
      current: "1.0.0-1",
      next: "1.0.1-1",
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.1-1",
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.1-0",
      options: {
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.1-beta",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.1-beta.0",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
        ignoreZeroNumber: false,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.1-beta.1",
      options: {
        prereleaseName: "beta",
      },
    },
    {
      current: "1.0.0",
      next: "1.0.1-1",
    },
  ],
  build: [
    {
      current: "1.2.3+build",
      next: "1.2.3+new-build",
      options: {
        build: "new-build",
      },
    },
  ],
  prerelease: [
    {
      current: "1.0.0-0",
      next: "1.0.0-1",
    },
    {
      current: "1.0.0-1",
      next: "1.0.0-2",
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.0-alpha.0",
      options: {
        initialNumber: 0,
        ignoreZeroNumber: true,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.0-alpha.1",
    },
    {
      current: "1.0.0-alpha.0",
      next: "1.0.0-alpha.1",
    },
    {
      current: "1.0.0-alpha.3",
      next: "1.0.0-alpha.4",
    },
    {
      current: "1.0.0-alpha.0",
      next: "1.0.0-1",
      options: {
        prereleaseName: "",
      },
    },
    {
      current: "1.0.0-alpha.1",
      next: "1.0.0-1",
      options: {
        prereleaseName: "",
      },
    },
    {
      current: "1.0.0-alpha.0",
      next: "1.0.0-beta.1",
      options: {
        prereleaseName: "beta",
      },
    },
    {
      current: "1.0.0-alpha.0",
      next: "1.0.0-beta",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
        ignoreZeroNumber: true,
      },
    },
    {
      current: "1.0.0-alpha.1",
      next: "1.0.0-beta",
      options: {
        prereleaseName: "beta",
        initialNumber: 0,
      },
    },
    {
      current: "1.0.0-alpha",
      next: "1.0.0-alpha.0",
      options: {
        prereleaseName: "alpha",
        initialNumber: 0,
      },
    },
    {
      current: "1.0.0-alpha.1",
      next: "1.0.0-beta.1",
      options: {
        prereleaseName: "beta",
      },
    },
    {
      current: "1.0.0",
      next: "1.0.1-1",
    },
  ],
};
