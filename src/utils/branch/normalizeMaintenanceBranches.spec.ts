import {
  BranchType,
  Package,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedSemVerPrereleaseOptions } from "@lets-release/semver";

import { MatchBranchWithTags } from "src/types/MatchBranchWithTags";
import { normalizeMaintenanceBranches } from "src/utils/branch/normalizeMaintenanceBranches";

const prerelease: NormalizedSemVerPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
  prefix: "-",
  suffix: ".",
};
const pkgs: Package[] = [
  {
    name: "a",
    path: "/path/to/a",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    name: "b",
    path: "/path/to/b",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    name: "c",
    path: "/path/to/c",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    name: "d",
    path: "/path/to/d",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.CalVer,
      format: "YY.MINOR.MICRO",
      prerelease,
    },
  },
  {
    name: "e",
    path: "/path/to/e",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.CalVer,
      format: "YY.MINOR.MICRO",
      prerelease,
    },
  },
  {
    name: "f",
    path: "/path/to/f",
    pluginName: "npm",
    versioning: {
      scheme: VersioningScheme.CalVer,
      format: "YY.MICRO",
      prerelease,
    },
  },
];
const main: MatchBranchWithTags<BranchType.main> = {
  type: BranchType.main,
  name: "main",
  channels: { default: [null] },
  tags: {
    a: [{ version: "3.0.0" }, { version: "3.2.3" }] as VersionTag[],
    b: [{ version: "2.8.0" }] as VersionTag[],
    d: [{ version: "3.0.0" }, { version: "3.2.3" }] as VersionTag[],
    e: [{ version: "2.8.0" }, { version: "4.0.0" }] as VersionTag[],
  },
};
const maintenance: MatchBranchWithTags<BranchType.maintenance>[] = [
  {
    type: BranchType.maintenance,
    name: "1.x",
    channels: { default: ["1.x"] },
    ranges: {
      a: "1.x",
      b: "1.x",
      d: "1.x.x",
      e: "1.x.x",
      f: "1.x",
    },
    tags: {
      a: [{ version: "1.0.0" }, { version: "1.2.3" }] as VersionTag[],
      d: [{ version: "1.0.0" }, { version: "1.2.3" }] as VersionTag[],
    },
  },
  {
    type: BranchType.maintenance,
    name: "2.0.x",
    channels: { default: ["2.0.x"] },
    ranges: {
      a: "2.0.x",
      b: "2.1.x",
      d: "2.0.x",
      e: "2.1.x",
      f: "2.x",
    },
    tags: {},
  },
  {
    type: BranchType.maintenance,
    name: "2.x",
    channels: { default: ["2.x"] },
    ranges: {
      a: "2.x",
      b: "2.x",
      d: "2.x.x",
      e: "2.x.x",
      f: "2.x",
    },
    tags: {},
  },
  {
    type: BranchType.maintenance,
    name: "3.x",
    channels: { default: ["3.x"] },
    ranges: {
      c: "3.x",
      e: "4.x.x",
    },
    tags: {},
  },
  {
    type: BranchType.maintenance,
    name: "3.x.x",
    channels: { default: ["3.x.x"] },
    ranges: {
      c: "3.x.x",
    },
    tags: {},
  },
];

describe("normalizeMaintenanceBranches", () => {
  it("should normalize maintenance branches with main branch", () => {
    expect(normalizeMaintenanceBranches(pkgs, main, maintenance)).toEqual([
      {
        type: "maintenance",
        channels: { default: ["1.x"] },
        name: "1.x",
        tags: {
          a: [
            {
              version: "1.0.0",
            },
            {
              version: "1.2.3",
            },
          ],
          d: [
            {
              version: "1.0.0",
            },
            {
              version: "1.2.3",
            },
          ],
        },
        ranges: {
          a: {
            min: "1.2.4",
            max: "2.0.0",
            mergeMin: "1.0.0",
            mergeMax: "2.0.0",
          },
          b: {
            min: "1.0.0",
            max: "2.0.0",
            mergeMin: "1.0.0",
            mergeMax: "2.0.0",
          },
          c: undefined,
          d: {
            min: "1.2.4",
            max: "2.0.0",
            mergeMin: "1.0.0",
            mergeMax: "2.0.0",
          },
          e: {
            min: "1.0.0",
            max: "2.0.0",
            mergeMin: "1.0.0",
            mergeMax: "2.0.0",
          },
          f: {
            min: "1.0",
            max: "2.0",
            mergeMin: "1.0",
            mergeMax: "2.0",
          },
        },
      },
      {
        type: "maintenance",
        channels: { default: ["2.0.x"] },
        name: "2.0.x",
        tags: {},
        ranges: {
          a: {
            min: "2.0.0",
            max: "2.1.0",
            mergeMin: "2.0.0",
            mergeMax: "2.1.0",
          },
          b: {
            min: "2.1.0",
            max: "2.2.0",
            mergeMin: "2.1.0",
            mergeMax: "2.2.0",
          },
          c: undefined,
          d: {
            min: "2.0.0",
            max: "2.1.0",
            mergeMin: "2.0.0",
            mergeMax: "2.1.0",
          },
          e: {
            min: "2.1.0",
            max: "2.2.0",
            mergeMin: "2.1.0",
            mergeMax: "2.2.0",
          },
          f: undefined,
        },
      },
      {
        type: "maintenance",
        channels: { default: ["2.x"] },
        name: "2.x",
        tags: {},
        ranges: {
          a: {
            min: "2.1.0",
            max: "3.0.0",
            mergeMin: "2.1.0",
            mergeMax: "3.0.0",
          },
          b: {
            min: "2.2.0",
            max: "2.8.0",
            mergeMin: "2.2.0",
            mergeMax: "3.0.0",
          },
          c: undefined,
          d: {
            min: "2.1.0",
            max: "3.0.0",
            mergeMin: "2.1.0",
            mergeMax: "3.0.0",
          },
          e: {
            min: "2.2.0",
            max: "2.8.0",
            mergeMin: "2.2.0",
            mergeMax: "3.0.0",
          },
          f: undefined,
        },
      },
      {
        type: "maintenance",
        channels: { default: ["3.x"] },
        name: "3.x",
        tags: {},
        ranges: {},
      },
      {
        type: "maintenance",
        channels: { default: ["3.x.x"] },
        name: "3.x.x",
        tags: {},
        ranges: {},
      },
    ]);
  });

  it("should normalize maintenance branches without main branch", () => {
    expect(normalizeMaintenanceBranches(pkgs, undefined, maintenance)).toEqual([
      {
        type: "maintenance",
        channels: { default: ["1.x"] },
        name: "1.x",
        tags: {
          a: [
            {
              version: "1.0.0",
            },
            {
              version: "1.2.3",
            },
          ],
          d: [
            {
              version: "1.0.0",
            },
            {
              version: "1.2.3",
            },
          ],
        },
        ranges: {
          a: undefined,
          b: undefined,
          c: undefined,
          d: {
            min: "1.2.4",
            max: "2.0.0",
            mergeMin: "1.0.0",
            mergeMax: "2.0.0",
          },
          e: {
            min: "1.0.0",
            max: "2.0.0",
            mergeMin: "1.0.0",
            mergeMax: "2.0.0",
          },
          f: {
            min: "1.0",
            max: "2.0",
            mergeMin: "1.0",
            mergeMax: "2.0",
          },
        },
      },
      {
        type: "maintenance",
        channels: { default: ["2.0.x"] },
        name: "2.0.x",
        tags: {},
        ranges: {
          a: undefined,
          b: undefined,
          c: undefined,
          d: {
            min: "2.0.0",
            max: "2.1.0",
            mergeMin: "2.0.0",
            mergeMax: "2.1.0",
          },
          e: {
            min: "2.1.0",
            max: "2.2.0",
            mergeMin: "2.1.0",
            mergeMax: "2.2.0",
          },
          f: undefined,
        },
      },
      {
        type: "maintenance",
        channels: { default: ["2.x"] },
        name: "2.x",
        tags: {},
        ranges: {
          a: undefined,
          b: undefined,
          c: undefined,
          d: {
            min: "2.1.0",
            max: "3.0.0",
            mergeMin: "2.1.0",
            mergeMax: "3.0.0",
          },
          e: {
            min: "2.2.0",
            max: "3.0.0",
            mergeMin: "2.2.0",
            mergeMax: "3.0.0",
          },
          f: undefined,
        },
      },
      {
        type: "maintenance",
        channels: { default: ["3.x"] },
        name: "3.x",
        tags: {},
        ranges: {
          e: {
            min: "4.0.0",
            max: "5.0.0",
            mergeMin: "4.0.0",
            mergeMax: "5.0.0",
          },
        },
      },
      {
        type: "maintenance",
        channels: { default: ["3.x.x"] },
        name: "3.x.x",
        tags: {},
        ranges: {},
      },
    ]);
  });
});
