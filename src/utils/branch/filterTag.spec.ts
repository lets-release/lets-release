import {
  Artifact,
  BaseContext,
  BranchType,
  MainBranch,
  Package,
  PrereleaseBranch,
  VersioningScheme,
} from "@lets-release/config";
import { DEFAULT_VERSIONING_PRERELEASE_OPTIONS } from "@lets-release/versioning";

import { filterTag } from "src/utils/branch/filterTag";
import { getPluginChannels } from "src/utils/branch/getPluginChannels";
import { getPluginPrereleaseName } from "src/utils/branch/getPluginPrereleaseName";

vi.mock("src/utils/branch/getPluginChannels");
vi.mock("src/utils/branch/getPluginPrereleaseName");

const baseContext = { options: { prerelease: "beta" } } as BaseContext;
const prereleaseBranch = { type: BranchType.prerelease } as PrereleaseBranch;
const mainBranch = { type: BranchType.main } as MainBranch;

describe("filterTag", () => {
  beforeEach(() => {
    vi.mocked(getPluginChannels)
      .mockReset()
      .mockRejectedValueOnce(["alpha"])
      .mockReturnValue(["beta"]);
    vi.mocked(getPluginPrereleaseName)
      .mockReset()
      .mockReturnValueOnce(undefined)
      .mockReturnValue("beta");
  });

  describe("SemVer", () => {
    const pkg = {
      versioning: {
        scheme: VersioningScheme.SemVer,
        prerelease: DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
      },
    } as Package;

    it("should return false if before version is greater than or equal to current version", () => {
      expect(
        filterTag(
          baseContext,
          prereleaseBranch,
          pkg,
          { version: "1.0.0-beta.1", artifacts: [] },
          "1.0.0-beta.2",
        ),
      ).toBe(false);
    });

    it("should return true if version is not a prerelease version", () => {
      expect(
        filterTag(baseContext, prereleaseBranch, pkg, {
          version: "1.0.0",
          artifacts: [],
        }),
      ).toBe(true);
    });

    it("should return value by verifying artifacts for prerelease branch", () => {
      expect(
        filterTag(baseContext, prereleaseBranch, pkg, {
          version: "1.0.0-beta.1",
          artifacts: [
            { pluginName: "plugin1", channels: ["beta"] },
            { pluginName: "plugin2", channels: ["beta"] },
            { pluginName: "plugin3", channels: ["beta"] },
          ] as Artifact[],
        }),
      ).toBe(true);
    });

    it("should return value by verifying artifacts for release branch", () => {
      expect(
        filterTag(baseContext, mainBranch, pkg, {
          version: "1.0.0-beta.1",
          artifacts: [
            { pluginName: "plugin1", channels: ["beta"] },
            { pluginName: "plugin2", channels: ["beta"] },
            { pluginName: "plugin3", channels: ["beta"] },
          ] as Artifact[],
        }),
      ).toBe(true);
    });

    it("should return false if prerelease option not provided for release branch", () => {
      expect(
        filterTag(
          { ...baseContext, options: {} } as BaseContext,
          mainBranch,
          pkg,
          {
            version: "1.0.0-beta.1",
            artifacts: [
              { pluginName: "plugin1", channels: ["beta"] },
              { pluginName: "plugin2", channels: ["beta"] },
              { pluginName: "plugin3", channels: ["beta"] },
            ] as Artifact[],
          },
        ),
      ).toBe(false);
    });
  });

  describe("CalVer", () => {
    const pkg = {
      versioning: {
        scheme: VersioningScheme.CalVer,
        format: "YY.MINOR.MICRO",
        prerelease: DEFAULT_VERSIONING_PRERELEASE_OPTIONS,
      },
    } as Package;

    it("should return false if before version is greater than or equal to current version", () => {
      expect(
        filterTag(
          baseContext,
          prereleaseBranch,
          pkg,
          { version: "1.0.0-beta.1", artifacts: [] },
          "1.0.0-beta.2",
        ),
      ).toBe(false);
    });

    it("should return true if version is not a prerelease version", () => {
      expect(
        filterTag(baseContext, prereleaseBranch, pkg, {
          version: "1.0.0",
          artifacts: [],
        }),
      ).toBe(true);
    });

    it("should return value by verifying artifacts for prerelease branch", () => {
      expect(
        filterTag(baseContext, prereleaseBranch, pkg, {
          version: "1.0.0-beta.1",
          artifacts: [
            { pluginName: "plugin1", channels: ["beta"] },
            { pluginName: "plugin2", channels: ["beta"] },
            { pluginName: "plugin3", channels: ["beta"] },
          ] as Artifact[],
        }),
      ).toBe(true);
    });

    it("should return value by verifying artifacts for release branch", () => {
      expect(
        filterTag(baseContext, mainBranch, pkg, {
          version: "1.0.0-beta.1",
          artifacts: [
            { pluginName: "plugin1", channels: ["beta"] },
            { pluginName: "plugin2", channels: ["beta"] },
            { pluginName: "plugin3", channels: ["beta"] },
          ] as Artifact[],
        }),
      ).toBe(true);
    });

    it("should return false if prerelease option not provided for release branch", () => {
      expect(
        filterTag(
          { ...baseContext, options: {} } as BaseContext,
          mainBranch,
          pkg,
          {
            version: "1.0.0-beta.1",
            artifacts: [
              { pluginName: "plugin1", channels: ["beta"] },
              { pluginName: "plugin2", channels: ["beta"] },
              { pluginName: "plugin3", channels: ["beta"] },
            ] as Artifact[],
          },
        ),
      ).toBe(false);
    });
  });
});
