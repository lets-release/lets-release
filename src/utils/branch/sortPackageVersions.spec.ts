import { Package, VersionTag, VersioningScheme } from "@lets-release/config";

import { sortPackageVersions } from "src/utils/branch/sortPackageVersions";

describe("sortPackageVersions", () => {
  describe("semver", () => {
    const pkg = {
      versioning: {
        scheme: VersioningScheme.SemVer,
      },
    } as Package;
    const versions = ["1.2.3", "1.1.0", "2.0.0", "2.3.4", "0.2.3"];
    const versionTags = versions.map((version) => ({
      version,
    })) as VersionTag[];

    it("should sort package versions in asc order", () => {
      expect(sortPackageVersions(pkg, versions)).toEqual([
        "0.2.3",
        "1.1.0",
        "1.2.3",
        "2.0.0",
        "2.3.4",
      ]);

      expect(sortPackageVersions(pkg, versionTags, "desc")).toEqual(
        ["2.3.4", "2.0.0", "1.2.3", "1.1.0", "0.2.3"].map((version) => ({
          version,
        })),
      );
    });

    it("should sort package versions in desc order", () => {
      expect(sortPackageVersions(pkg, versionTags, "desc")).toEqual(
        ["2.3.4", "2.0.0", "1.2.3", "1.1.0", "0.2.3"].map((version) => ({
          version,
        })),
      );
    });
  });

  describe("calver", () => {
    const pkg = {
      versioning: {
        scheme: VersioningScheme.CalVer,
        format: "YY.MINOR.MICRO",
      },
    } as Package;
    const versions = ["1.2.3", "1.1.0", "2.0.0", "2.3.4", "2.2.3"];
    const versionTags = versions.map((version) => ({
      version,
    })) as VersionTag[];

    it("should sort package versions in asc order", () => {
      expect(sortPackageVersions(pkg, versions)).toEqual([
        "1.1.0",
        "1.2.3",
        "2.0.0",
        "2.2.3",
        "2.3.4",
      ]);
    });

    it("should sort package versions in desc order", () => {
      expect(sortPackageVersions(pkg, versionTags, "desc")).toEqual(
        ["2.3.4", "2.2.3", "2.0.0", "1.2.3", "1.1.0"].map((version) => ({
          version,
        })),
      );
    });
  });
});
