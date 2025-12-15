import {
  BranchType,
  PrereleaseBranch,
  ReleaseBranch,
} from "@lets-release/config";

import { getPluginPrereleaseName } from "src/utils/branch/getPluginPrereleaseName";

describe("getPluginPrereleaseName", () => {
  describe("prerelease branch", () => {
    it("should return prerelease.name if prerelease.name is string", () => {
      expect(
        getPluginPrereleaseName({
          type: BranchType.prerelease,
          name: "alpha",
          prerelease: {
            name: { default: "alpha" },
          },
        } as unknown as PrereleaseBranch),
      ).toBe("alpha");
    });

    it("should return value from prerelease name object", () => {
      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.prerelease,
            name: "alpha",
            prerelease: {
              name: { default: "alpha", npm: "npm-alpha" },
            },
          } as unknown as PrereleaseBranch,
          "npm",
        ),
      ).toBe("npm-alpha");
    });

    it("should return default value from prerelease name object if plugin specific name is not found", () => {
      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.prerelease,
            name: "alpha",
            prerelease: {
              name: { default: "alpha", npm: "npm-alpha" },
            },
          } as unknown as PrereleaseBranch,
          "python",
        ),
      ).toBe("alpha");
    });
  });

  describe("release branch", () => {
    it("should return undefined if prerelease key is not provided", () => {
      expect(
        getPluginPrereleaseName({
          type: BranchType.main,
          name: "main",
        } as never),
      ).toBeUndefined();
    });

    it("should return prerelease key as prerelease name if prereleases options is not provided", () => {
      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.main,
            name: "main",
          } as unknown as ReleaseBranch,
          "alpha",
          "npm",
        ),
      ).toBe("alpha");

      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.main,
            name: "main",
          } as unknown as ReleaseBranch,
          "alpha",
          "npm",
        ),
      ).toBe("alpha");
    });

    it("should return undefined if prereleases options is not provided and prerelease key is not valid prerelease name", () => {
      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.main,
            name: "main",
          } as unknown as ReleaseBranch,
          "alpha test",
          "npm",
        ),
      ).toBeUndefined();

      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.main,
            name: "main",
          } as unknown as ReleaseBranch,
          "alpha test",
          "npm",
        ),
      ).toBeUndefined();
    });

    it("should return value from prereleases options", () => {
      expect(
        getPluginPrereleaseName(
          {
            type: BranchType.main,
            name: "main",
            prereleases: {
              alpha: {
                name: { npm: "npm-alpha" },
              },
            },
          } as unknown as ReleaseBranch,
          "alpha",
          "npm",
        ),
      ).toBe("npm-alpha");
    });
  });
});
