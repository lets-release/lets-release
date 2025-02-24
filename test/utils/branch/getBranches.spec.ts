import path from "node:path";

import { CalVerOptions } from "@lets-release/calver";
import { BaseContext, Options, VersioningScheme } from "@lets-release/config";
import { SemVerOptions } from "@lets-release/semver";

import { getBranches } from "src/utils/branch/getBranches";
import { addNote } from "test/__helpers__/git/addNote";
import { addTag } from "test/__helpers__/git/addTag";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { pushBranch } from "test/__helpers__/git/pushBranch";

const artifacts = [
  {
    pluginName: "npm",
    channels: [null],
    name: "npm package",
  },
];

describe("getBranches", () => {
  it("should get branches with tags and artifacts", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await addTag(cwd, "v1.0.0");
    await addNote(cwd, "v1.0.0", artifacts);
    await commit(cwd, "second commit");
    await addTag(cwd, "v1.1.0");
    await addNote(cwd, "v1.1.0", artifacts);
    await commit(cwd, "third commit");
    await addTag(cwd, "invalid");
    await commit(cwd, "fourth commit");
    await addTag(cwd, "v2.0.0");
    await addNote(cwd, "v2.0.0", artifacts);
    await pushBranch(cwd, url, "main");

    await expect(
      getBranches(
        {
          repositoryRoot: cwd,
          options: await Options.parseAsync({
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: VersioningScheme.SemVer },
              },
            ],
          }),
        } as BaseContext,
        url,
        "main",
        [
          {
            main: true,
            path: cwd,
            type: "npm",
            name: "main",
            uniqueName: "main",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
        ],
      ),
    ).resolves.toEqual({
      main: {
        type: "main",
        channels: {
          default: [null],
        },
        name: "main",
        tags: {
          main: ["2.0.0", "1.1.0", "1.0.0"].map((version) => ({
            package: "main",
            tag: `v${version}`,
            version,
            artifacts: [
              {
                pluginName: "npm",
                channels: [null],
                name: "npm package",
              },
            ],
          })),
        },
        ranges: {
          main: {
            min: "2.0.1",
          },
        },
      },
      maintenance: [],
      prerelease: [],
    });
  });

  it("should get branches with correct release ranges", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second commit");
    await addTag(cwd, "v1.0.1");
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "next", "v1.0.0");
    await commit(cwd, "third commit");
    await addTag(cwd, "v1.1.0");
    await commit(cwd, "fourth commit");
    await addTag(cwd, "v1.1.1");
    await pushBranch(cwd, url, "next");

    await checkoutBranch(cwd, "next-major", "v1.1.0");
    await commit(cwd, "fifth commit");
    await addTag(cwd, "v2.0.0");
    await commit(cwd, "sixth commit");
    await addTag(cwd, "v2.0.1");
    await pushBranch(cwd, url, "next-major");

    await expect(
      getBranches(
        {
          repositoryRoot: cwd,
          options: await Options.parseAsync({
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: VersioningScheme.SemVer },
              },
            ],
          }),
        } as BaseContext,
        url,
        "main",
        [
          {
            main: true,
            path: cwd,
            type: "npm",
            name: "main",
            uniqueName: "main",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
        ],
      ),
    ).resolves.toEqual({
      main: {
        type: "main",
        channels: {
          default: [null],
        },
        name: "main",
        prerelease: undefined,
        prereleases: undefined,
        tags: {
          main: ["1.0.1", "1.0.0"].map((version) => ({
            package: "main",
            tag: `v${version}`,
            version,
            artifacts: [],
          })),
        },
        ranges: {
          main: {
            min: "1.0.2",
            max: "1.1.0",
          },
        },
      },
      next: {
        type: "next",
        channels: {
          default: ["next"],
        },
        name: "next",
        prerelease: undefined,
        prereleases: undefined,
        tags: {
          main: ["1.1.1", "1.1.0", "1.0.0"].map((version) => ({
            package: "main",
            tag: `v${version}`,
            version,
            artifacts: [],
          })),
        },
        ranges: {
          main: {
            min: "1.1.2",
            max: "2.0.0",
          },
        },
      },
      nextMajor: {
        type: "nextMajor",
        channels: {
          default: ["next-major"],
        },
        name: "next-major",
        prerelease: undefined,
        prereleases: undefined,
        tags: {
          main: ["2.0.1", "2.0.0", "1.1.0", "1.0.0"].map((version) => ({
            package: "main",
            tag: `v${version}`,
            version,
            artifacts: [],
          })),
        },
        ranges: {
          main: {
            min: "2.0.2",
            max: undefined,
          },
        },
      },
      maintenance: [],
      prerelease: [],
    });
  });

  it("should get branches with correct maintenance ranges for main package", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second commit");
    await addTag(cwd, "v1.1.0");
    await commit(cwd, "third commit");
    await addTag(cwd, "v2.0.0");
    await commit(cwd, "fourth commit");
    await addTag(cwd, "v3.0.0");
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "1.0.x", "v1.0.0");
    await commit(cwd, "fifth commit");
    await addTag(cwd, "v1.0.1");
    await pushBranch(cwd, url, "1.0.x");

    await checkoutBranch(cwd, "1.x.x", "v1.1.0");
    await commit(cwd, "sixth commit");
    await addTag(cwd, "v1.1.1");
    await pushBranch(cwd, url, "1.x.x");

    await checkoutBranch(cwd, "2.x", "v2.0.0");
    await commit(cwd, "seventh commit");
    await addTag(cwd, "v2.0.1");
    await pushBranch(cwd, url, "2.x");

    await expect(
      getBranches(
        {
          repositoryRoot: cwd,
          options: await Options.parseAsync({
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: VersioningScheme.SemVer },
              },
            ],
          }),
        } as BaseContext,
        url,
        "main",
        [
          {
            main: true,
            path: cwd,
            type: "npm",
            name: "main",
            uniqueName: "main",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
        ],
      ),
    ).resolves.toEqual({
      main: {
        type: "main",
        channels: {
          default: [null],
        },
        name: "main",
        prerelease: undefined,
        prereleases: undefined,
        tags: {
          main: ["3.0.0", "2.0.0", "1.1.0", "1.0.0"].map((version) => ({
            package: "main",
            tag: `v${version}`,
            version,
            artifacts: [],
          })),
        },
        ranges: {
          main: {
            min: "3.0.1",
            max: undefined,
          },
        },
      },
      next: undefined,
      nextMajor: undefined,
      maintenance: [
        {
          type: "maintenance",
          channels: {
            default: ["1.0.x"],
          },
          name: "1.0.x",
          prerelease: undefined,
          prereleases: undefined,
          tags: {
            main: ["1.0.1", "1.0.0"].map((version) => ({
              package: "main",
              tag: `v${version}`,
              version,
              artifacts: [],
            })),
          },
          ranges: {
            main: {
              min: "1.0.2",
              max: "1.1.0",
              mergeMin: "1.0.0",
              mergeMax: "1.1.0",
            },
          },
        },
        {
          type: "maintenance",
          channels: {
            default: ["1.x.x"],
          },
          name: "1.x.x",
          prerelease: undefined,
          prereleases: undefined,
          tags: {
            main: ["1.1.1", "1.1.0", "1.0.0"].map((version) => ({
              package: "main",
              tag: `v${version}`,
              version,
              artifacts: [],
            })),
          },
          ranges: {
            main: {
              min: "1.1.2",
              max: "2.0.0",
              mergeMin: "1.1.0",
              mergeMax: "2.0.0",
            },
          },
        },
        {
          type: "maintenance",
          channels: {
            default: ["2.x"],
          },
          name: "2.x",
          prerelease: undefined,
          prereleases: undefined,
          tags: {
            main: ["2.0.1", "2.0.0", "1.1.0", "1.0.0"].map((version) => ({
              package: "main",
              tag: `v${version}`,
              version,
              artifacts: [],
            })),
          },
          ranges: {
            main: {
              min: "2.0.2",
              max: "3.0.0",
              mergeMin: "2.0.0",
              mergeMax: "3.0.0",
            },
          },
        },
      ],
      prerelease: [],
    });
  });

  it("should get branches with multi-packages", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await commit(cwd, "first commit");
    await addTag(cwd, "v1.0.0");
    await commit(cwd, "second commit");
    await addTag(cwd, "a/v1.0.0");
    await commit(cwd, "third commit");
    await addTag(cwd, "b/v1.0.0");
    await commit(cwd, "fourth commit");
    await addTag(cwd, "v2.0.0");
    await commit(cwd, "fifth commit");
    await addTag(cwd, "a/v2.0.0");
    await commit(cwd, "sixth commit");
    await addTag(cwd, "b/v2.0.0");
    await pushBranch(cwd, url, "main");

    await checkoutBranch(cwd, "1.x", "b/v1.0.0");
    await commit(cwd, "seventh commit");
    await addTag(cwd, "v1.1.0");
    await commit(cwd, "eighth commit");
    await addTag(cwd, "a/v1.1.0");
    await commit(cwd, "ninth commit");
    await addTag(cwd, "b/v1.1.0");
    await pushBranch(cwd, url, "1.x");

    await expect(
      getBranches(
        {
          repositoryRoot: cwd,
          options: await Options.parseAsync({
            packages: [
              {
                paths: ["./"],
                versioning: { scheme: VersioningScheme.SemVer },
              },
            ],
          }),
        } as BaseContext,
        url,
        "main",
        [
          {
            main: true,
            path: cwd,
            type: "npm",
            name: "main",
            uniqueName: "main",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
          {
            path: path.resolve(cwd, "a"),
            type: "npm",
            name: "a",
            uniqueName: "a",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
          {
            path: path.resolve(cwd, "b"),
            type: "npm",
            name: "b",
            uniqueName: "b",
            pluginName: "npm",
            versioning: await CalVerOptions.parseAsync({
              scheme: VersioningScheme.CalVer,
              format: "YY.MINOR.MICRO",
            }),
          },
        ],
      ),
    ).resolves.toEqual({
      main: {
        type: "main",
        channels: {
          default: [null],
        },
        name: "main",
        prerelease: undefined,
        prereleases: undefined,
        tags: {
          main: ["2.0.0", "1.0.0"].map((version) => ({
            package: "main",
            tag: `v${version}`,
            version,
            artifacts: [],
          })),
          a: ["2.0.0", "1.0.0"].map((version) => ({
            package: "a",
            tag: `a/v${version}`,
            version,
            artifacts: [],
          })),
          b: ["2.0.0", "1.0.0"].map((version) => ({
            package: "b",
            tag: `b/v${version}`,
            version,
            artifacts: [],
          })),
        },
        ranges: {
          main: {
            min: "2.0.1",
            max: undefined,
          },
          a: {
            min: "2.0.1",
            max: undefined,
          },
          b: undefined,
        },
      },
      next: undefined,
      nextMajor: undefined,
      maintenance: [
        {
          type: "maintenance",
          channels: {
            default: ["1.x"],
          },
          name: "1.x",
          prerelease: undefined,
          prereleases: undefined,
          tags: {
            main: ["1.1.0", "1.0.0"].map((version) => ({
              package: "main",
              tag: `v${version}`,
              version,
              artifacts: [],
            })),
            a: ["1.1.0", "1.0.0"].map((version) => ({
              package: "a",
              tag: `a/v${version}`,
              version,
              artifacts: [],
            })),
            b: ["1.1.0", "1.0.0"].map((version) => ({
              package: "b",
              tag: `b/v${version}`,
              version,
              artifacts: [],
            })),
          },
          ranges: {
            main: {
              min: "1.1.1",
              max: "2.0.0",
              mergeMin: "1.0.0",
              mergeMax: "2.0.0",
            },
            a: undefined,
            b: undefined,
          },
        },
      ],
      prerelease: [],
    });
  });
});
