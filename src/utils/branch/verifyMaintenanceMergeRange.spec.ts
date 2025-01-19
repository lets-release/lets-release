import {
  MaintenanceVersionRange,
  Package,
  VersioningScheme,
} from "@lets-release/config";

import { verifyMaintenanceMergeRange } from "src/utils/branch/verifyMaintenanceMergeRange";

describe("verifyMaintenanceMergeRange", () => {
  describe("semver", () => {
    const pkg = {
      versioning: {
        scheme: VersioningScheme.SemVer,
      },
    } as Package;
    const range = {
      mergeMin: "1.0.0",
      mergeMax: "2.0.0",
    } as MaintenanceVersionRange;

    it("should return true if version is in range", () => {
      expect(verifyMaintenanceMergeRange(pkg, range, "1.0.0")).toBeTruthy();
      expect(verifyMaintenanceMergeRange(pkg, range, "1.2.3")).toBeTruthy();
    });

    it("should return false if version is not in range", () => {
      expect(verifyMaintenanceMergeRange(pkg, range, "0.1.0")).toBeFalsy();
      expect(verifyMaintenanceMergeRange(pkg, range, "2.0.0")).toBeFalsy();
      expect(verifyMaintenanceMergeRange(pkg, range, "2.1.0")).toBeFalsy();
    });
  });

  describe("calver", () => {
    const pkg = {
      versioning: {
        scheme: VersioningScheme.CalVer,
        format: "YY.MINOR.MICRO",
      },
    } as Package;
    const range = {
      mergeMin: "2.0.0",
      mergeMax: "3.0.0",
    } as MaintenanceVersionRange;

    it("should return true if version is in range", () => {
      expect(verifyMaintenanceMergeRange(pkg, range, "2.0.0")).toBeTruthy();
      expect(verifyMaintenanceMergeRange(pkg, range, "2.2.3")).toBeTruthy();
    });

    it("should return false if version is not in range", () => {
      expect(verifyMaintenanceMergeRange(pkg, range, "1.1.0")).toBeFalsy();
      expect(verifyMaintenanceMergeRange(pkg, range, "3.0.0")).toBeFalsy();
      expect(verifyMaintenanceMergeRange(pkg, range, "3.1.0")).toBeFalsy();
    });
  });
});
