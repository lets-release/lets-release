import { NormalizedPackageJson } from "read-pkg";

import { UnsupportedNpmPackageManagerVersionError } from "src/errors/UnsupportedNpmPackageManagerVersionError";
import { NpmPackageManager } from "src/types/NpmPackageManager";

const pkg = { name: "pkg" } as NormalizedPackageJson;
const pm = { name: "npm" } as NpmPackageManager;
const requiredVersion = ">=7.0.0";
const currentVersion = "6.14.8";

describe("UnsupportedNpmPackageManagerVersionError", () => {
  it("should be defined", () => {
    const error = new UnsupportedNpmPackageManagerVersionError(
      pkg,
      pm,
      requiredVersion,
      currentVersion,
    );

    expect(error.message).toBe("Unsupported npm version.");
    expect(error.details).toBe(
      "npm version >=7.0.0 is required. Found 6.14.8 for package pkg.",
    );
  });
});
