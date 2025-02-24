import {
  Artifact,
  BaseContext,
  BranchType,
  Package,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { getReleases } from "src/utils/branch/getReleases";

const context = {
  env: process.env,
  repositoryRoot: "/path/to/repo",
  options: {},
} as BaseContext;
const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const packages: Package[] = [
  {
    path: "/path/to/repo/a",
    type: "npm",
    name: "a",
    uniqueName: "a",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    path: "/path/to/repo/b",
    type: "npm",
    name: "b",
    uniqueName: "b",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.CalVer,
      format: "YYYY.0M.0D",
      prerelease,
    },
  },
  {
    path: "/path/to/repo/c",
    type: "npm",
    name: "c",
    uniqueName: "c",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
];

describe("getReleases", () => {
  it("should get the last releases from prerelease branch", () => {
    expect(
      getReleases(
        context,
        {
          type: BranchType.prerelease,
          name: "alpha",
          prerelease: {
            name: { default: "alpha" },
            channels: { default: ["alpha"], python: ["a"] },
          },
          tags: {
            a: [
              {
                package: "a",
                version: "1.0.0-alpha.1",
                tag: "v1.0.0-alpha.1",
                artifacts: [
                  { pluginName: "npm", channels: ["alpha"] },
                ] as Artifact[],
              },
              {
                package: "a",
                version: "1.0.0-alpha.2",
                tag: "v1.0.0-alpha.2",
                artifacts: [
                  { pluginName: "npm", channels: ["next-alpha"] },
                ] as Artifact[],
              },
              {
                package: "a",
                version: "1.0.0-beta.1",
                tag: "v1.0.0-beta.1",
                artifacts: [
                  { pluginName: "npm", channels: ["beta"] },
                ] as Artifact[],
              },
            ],
            b: [
              {
                package: "b",
                version: "2022.01.01-alpha.1",
                tag: "v2022.01.01-alpha.1",
                artifacts: [
                  { pluginName: "npm", channels: ["alpha"] },
                ] as Artifact[],
              },
              {
                package: "b",
                version: "2022.01.01-alpha.2",
                tag: "v2022.01.01-alpha.2",
                artifacts: [
                  { pluginName: "npm", channels: ["next-alpha"] },
                ] as Artifact[],
              },
              {
                package: "b",
                version: "2022.01.01-beta.1",
                tag: "v2022.01.01-beta.1",
                artifacts: [
                  { pluginName: "npm", channels: ["beta"] },
                ] as Artifact[],
              },
            ],
            c: [],
          },
        },
        packages,
      ),
    ).toEqual({
      a: [
        {
          version: "1.0.0-alpha.1",
          tag: "v1.0.0-alpha.1",
          artifacts: [{ pluginName: "npm", channels: ["alpha"] }] as Artifact[],
          package: "a",
        },
      ],
      b: [
        {
          version: "2022.01.01-alpha.1",
          tag: "v2022.01.01-alpha.1",
          artifacts: [{ pluginName: "npm", channels: ["alpha"] }] as Artifact[],
          package: "b",
        },
      ],
      c: [],
    });
  });

  it("should get the last releases from release branch", () => {
    expect(
      getReleases(
        context,
        {
          type: BranchType.main,
          name: "main",
          channels: { default: [null] },
          ranges: {
            a: {
              min: "1.0.0",
            },
            b: {
              min: "2022.01.01",
            },
            c: {
              min: "1.0.0",
            },
          },
          tags: {
            a: [
              {
                package: "a",
                version: "1.0.0-alpha.1",
                tag: "v1.0.0-alpha.1",
                artifacts: [
                  { pluginName: "npm", channels: ["alpha"] },
                ] as Artifact[],
              },
              {
                package: "a",
                version: "1.0.0",
                tag: "v1.0.0",
                artifacts: [
                  { pluginName: "npm", channels: [null] },
                ] as Artifact[],
              },
              {
                package: "a",
                version: "2.0.0",
                tag: "v2.0.0",
                artifacts: [
                  { pluginName: "npm", channels: [null] },
                ] as Artifact[],
              },
            ],
            b: [
              {
                package: "b",
                version: "2022.01.01-alpha.1",
                tag: "v2022.01.01-alpha.1",
                artifacts: [
                  { pluginName: "npm", channels: ["alpha"] },
                ] as Artifact[],
              },
              {
                package: "b",
                version: "2022.01.01",
                tag: "v2022.01.01",
                artifacts: [
                  { pluginName: "npm", channels: [null] },
                ] as Artifact[],
              },
              {
                package: "b",
                version: "2023.01.01",
                tag: "v2023.01.01",
                artifacts: [
                  { pluginName: "npm", channels: [null] },
                ] as Artifact[],
              },
            ],
            c: [],
          },
        },
        packages,
        {
          a: "2.0.0",
          b: "2023.01.01",
          c: "2.0.0",
        },
      ),
    ).toEqual({
      a: [
        {
          version: "1.0.0",
          tag: "v1.0.0",
          artifacts: [{ pluginName: "npm", channels: [null] }] as Artifact[],
          package: "a",
        },
      ],
      b: [
        {
          version: "2022.01.01",
          tag: "v2022.01.01",
          artifacts: [{ pluginName: "npm", channels: [null] }] as Artifact[],
          package: "b",
        },
      ],
      c: [],
    });
  });

  it("should get the last releases from release branch with prerelease option", () => {
    expect(
      getReleases(
        {
          ...context,
          options: {
            prerelease: "alpha",
          },
        } as BaseContext,
        {
          type: BranchType.main,
          name: "main",
          channels: { default: [null] },
          prereleases: {
            alpha: {
              name: { default: "alpha" },
              channels: { default: ["alpha"] },
            },
          },
          ranges: {
            a: {
              min: "1.0.0",
            },
            b: {
              min: "2022.01.01",
            },
          },
          tags: {
            a: [
              {
                package: "a",
                version: "1.0.0-alpha.1",
                tag: "v1.0.0-alpha.1",
                artifacts: [
                  { pluginName: "npm", channels: ["alpha"] },
                ] as Artifact[],
              },
            ],
            b: [
              {
                package: "b",
                version: "2022.01.01-alpha.1",
                tag: "v2022.01.01-alpha.1",
                artifacts: [
                  { pluginName: "npm", channels: ["alpha"] },
                ] as Artifact[],
              },
            ],
          },
        },
        packages,
      ),
    ).toEqual({
      a: [
        {
          version: "1.0.0-alpha.1",
          tag: "v1.0.0-alpha.1",
          artifacts: [{ pluginName: "npm", channels: ["alpha"] }] as Artifact[],
          package: "a",
        },
      ],
      b: [
        {
          version: "2022.01.01-alpha.1",
          tag: "v2022.01.01-alpha.1",
          artifacts: [{ pluginName: "npm", channels: ["alpha"] }] as Artifact[],
          package: "b",
        },
      ],
      c: [],
    });
  });
});
