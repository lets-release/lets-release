import {
  Artifact,
  BaseContext,
  BranchType,
  Branches,
  MainBranch,
  MaintenanceBranch,
  Package,
  VersionTag,
  VersioningScheme,
} from "@lets-release/config";
import { NormalizedVersioningPrereleaseOptions } from "@lets-release/versioning";

import { getMergingContexts } from "src/utils/branch/getMergingContexts";
import { getReleases } from "src/utils/branch/getReleases";
import { getTagHash } from "src/utils/git/getTagHash";

vi.mock("src/utils/branch/getReleases");
vi.mock("src/utils/git/getTagHash");

const hash = "hash";

vi.mocked(getTagHash).mockResolvedValue(hash);

const context = {
  env: process.env,
  repositoryRoot: "/path/to/repo",
  options: {},
} as BaseContext;
const prerelease: NormalizedVersioningPrereleaseOptions = {
  initialNumber: 1,
  ignoreZeroNumber: true,
};
const packages: Package[] = [
  {
    path: "/path/to/repo/a",
    type: "npm",
    name: "a",
    uniqueName: "npm/a",
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
    uniqueName: "npm/b",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    path: "/path/to/repo/c",
    type: "npm",
    name: "c",
    uniqueName: "npm/c",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease,
    },
  },
  {
    path: "/path/to/repo/d",
    type: "npm",
    name: "d",
    uniqueName: "npm/d",
    pluginName: "plugin",
    versioning: {
      scheme: VersioningScheme.CalVer,
      format: "YYYY.MINOR.MICRO",
      prerelease,
    },
  },
];
const main: MainBranch = {
  type: BranchType.main,
  name: "main",
  channels: { default: [null] },
  ranges: {
    "npm/a": { min: "1.9.0", max: "1.10.0" },
    "npm/b": { min: "1.9.0", max: "1.10.0" },
    "npm/c": { min: "1.0.0" },
    "npm/d": { min: "2022.0.0" },
  },
  tags: {
    "npm/a": [
      {
        package: "a",
        tag: "v1.0.0",
        version: "1.0.0",
        artifacts: [{ pluginName: "npm", channels: [null] }] as Artifact[],
      },
      {
        package: "a",
        tag: "v1.10.3",
        version: "1.10.3",
        artifacts: [{ pluginName: "npm", channels: ["next"] }] as Artifact[],
      },
      {
        package: "a",
        tag: "v2.0.3",
        version: "2.0.3",
        artifacts: [
          { pluginName: "npm", channels: ["next-major"] },
        ] as Artifact[],
      },
      {
        package: "a",
        tag: "v2.1.3",
        version: "2.1.3",
        artifacts: [{ pluginName: "npm", channels: [null] }] as Artifact[],
      },
      {
        package: "a",
        tag: "v2.2.3",
        version: "2.2.3",
        artifacts: [{ pluginName: "npm", channels: ["unknown"] }] as Artifact[],
      },
    ],
    "npm/b": [
      {
        package: "b",
        tag: "v1.10.3",
        version: "1.10.3",
        artifacts: [{ pluginName: "npm", channels: ["next"] }] as Artifact[],
      },
    ],
    "npm/c": undefined,
    "npm/d": [
      {
        package: "d",
        tag: "v2022.0.0",
        version: "2022.0.0",
        artifacts: [{ pluginName: "npm", channels: [null] }] as Artifact[],
      },
      {
        package: "d",
        tag: "v2022.10.3",
        version: "2022.10.3",
        artifacts: [{ pluginName: "npm", channels: ["next"] }] as Artifact[],
      },
      {
        package: "d",
        tag: "v2022.0.3",
        version: "2022.0.3",
        artifacts: [
          { pluginName: "npm", channels: ["next-major"] },
        ] as Artifact[],
      },
    ],
  },
};
const maintenance: MaintenanceBranch = {
  type: BranchType.maintenance,
  name: "x.1.x",
  channels: { default: ["1.1.x"] },
  ranges: {
    "npm/a": {
      min: "1.1.3",
      max: "1.2.0",
      mergeMin: "1.1.3",
      mergeMax: "1.2.0",
    },
    "npm/b": undefined,
    "npm/c": undefined,
    "npm/d": {
      min: "2022.1.3",
      max: "2022.2.0",
      mergeMin: "2022.1.3",
      mergeMax: "2022.2.0",
    },
  },
  tags: {
    "npm/a": [
      {
        package: "a",
        tag: "v1.1.2",
        version: "1.1.2",
        artifacts: [{ pluginName: "npm", channels: ["1.1.x"] }] as Artifact[],
      },
      {
        package: "a",
        tag: "v1.2.3",
        version: "1.2.3",
        artifacts: [{ pluginName: "npm", channels: ["1.2.x"] }] as Artifact[],
      },
      {
        package: "a",
        tag: "v1.3.3",
        version: "1.3.3",
        artifacts: [{ pluginName: "npm", channels: ["1.3.x"] }] as Artifact[],
      },
    ],
    "npm/b": undefined,
    "npm/c": undefined,
    "npm/d": [
      {
        package: "d",
        tag: "v2022.1.2",
        version: "2022.1.2",
        artifacts: [{ pluginName: "npm", channels: ["1.1.x"] }] as Artifact[],
      },
      {
        package: "d",
        tag: "v2022.2.3",
        version: "2022.2.3",
        artifacts: [{ pluginName: "npm", channels: ["1.2.x"] }] as Artifact[],
      },
      {
        package: "d",
        tag: "v2022.3.3",
        version: "2022.3.3",
        artifacts: [{ pluginName: "npm", channels: ["1.3.x"] }] as Artifact[],
      },
    ],
  },
};
const branches: Branches = {
  main,
  next: {
    type: BranchType.next,
    name: "next",
    channels: { default: ["next"] },
    ranges: {
      "npm/a": { min: "1.10.0", max: "2.0.0" },
    },
    tags: {},
  },
  nextMajor: {
    type: BranchType.nextMajor,
    name: "next",
    channels: { default: ["next-major"] },
    ranges: {
      "npm/a": { min: "2.0.0" },
    },
    tags: {},
  },
  maintenance: [
    maintenance,
    {
      type: BranchType.maintenance,
      name: "x.0.x",
      channels: { default: ["1.0.x"] },
      ranges: {},
      tags: {},
    },
    {
      type: BranchType.maintenance,
      name: "x.2.x",
      channels: { default: ["1.2.x"] },
      ranges: {
        "npm/a": {
          min: "1.2.3",
          max: "1.3.0",
          mergeMin: "1.2.3",
          mergeMax: "1.3.0",
        },
        "npm/b": undefined,
        "npm/c": undefined,
        "npm/d": {
          min: "2022.2.3",
          max: "2022.3.0",
          mergeMin: "2022.2.3",
          mergeMax: "2022.3.0",
        },
      },
      tags: {},
    },
    {
      type: BranchType.maintenance,
      name: "x.3.x",
      channels: { default: ["1.3.x"] },
      ranges: {
        "npm/a": {
          min: "1.3.3",
          max: "1.4.0",
          mergeMin: "1.3.3",
          mergeMax: "1.4.0",
        },
        "npm/b": undefined,
        "npm/c": undefined,
        "npm/d": {
          min: "2022.3.3",
          max: "2022.4.0",
          mergeMin: "2022.3.3",
          mergeMax: "2022.4.0",
        },
      },
      tags: {},
    },
    {
      type: BranchType.maintenance,
      name: "x.4.x",
      channels: { default: ["1.4.x"] },
      ranges: {},
      tags: {},
    },
  ],
};

describe("getMergingContexts", () => {
  beforeEach(() => {
    vi.mocked(getReleases).mockReset().mockReturnValue({});
  });

  it("should get merging contexts for maintenance branch", async () => {
    vi.mocked(getReleases).mockReturnValue({});

    await expect(
      getMergingContexts(context, packages, branches, maintenance),
    ).resolves.toEqual({
      "npm/a": {
        lastRelease: undefined,
        currentRelease: {
          version: "1.3.3",
          artifacts: [{ pluginName: "npm", channels: ["1.3.x"] }],
          tag: "v1.3.3",
          hash: "hash",
        },
        nextRelease: {
          version: "1.3.3",
          channels: { default: ["1.1.x"] },
          tag: "v1.3.3",
          hash: "hash",
        },
      },
      "npm/d": {
        lastRelease: undefined,
        currentRelease: {
          version: "2022.3.3",
          artifacts: [{ pluginName: "npm", channels: ["1.3.x"] }],
          tag: "v2022.3.3",
          hash: "hash",
        },
        nextRelease: {
          version: "2022.3.3",
          channels: { default: ["1.1.x"] },
          tag: "v2022.3.3",
          hash: "hash",
        },
      },
    });
  });

  it("should get merging contexts for release branch", async () => {
    const aLastRelease = {
      version: "2.0.0",
    } as VersionTag;
    const bLastRelease = {
      version: "2.0.0",
    } as VersionTag;
    const dLastRelease = {
      version: "2022.0.0",
    } as VersionTag;

    vi.mocked(getReleases).mockReturnValue({
      "npm/a": [aLastRelease],
      "npm/b": [bLastRelease],
      "npm/c": [],
      "npm/d": [dLastRelease],
    });

    await expect(
      getMergingContexts(context, packages, branches, main),
    ).resolves.toEqual({
      "npm/a": {
        lastRelease: { ...aLastRelease, hash },
        currentRelease: {
          version: "2.0.3",
          artifacts: [{ pluginName: "npm", channels: ["next-major"] }],
          tag: "v2.0.3",
          hash: "hash",
        },
        nextRelease: {
          version: "2.0.3",
          channels: { default: [null] },
          tag: "v2.0.3",
          hash: "hash",
        },
      },
      "npm/d": {
        lastRelease: { ...dLastRelease, hash },
        currentRelease: {
          version: "2022.10.3",
          artifacts: [{ pluginName: "npm", channels: ["next"] }],
          tag: "v2022.10.3",
          hash: "hash",
        },
        nextRelease: {
          version: "2022.10.3",
          channels: { default: [null] },
          tag: "v2022.10.3",
          hash: "hash",
        },
      },
    });
  });
});
