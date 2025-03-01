import { NormalizedPackageJson } from "read-pkg";

import { NoNpmPackageManagerBinaryError } from "src/errors/NoNpmPackageManagerBinaryError";
import { NpmPackageManager } from "src/types/NpmPackageManager";

const pkg = { name: "pkg" } as NormalizedPackageJson;
const pm = { name: "npm" } as NpmPackageManager;

describe("NoNpmPackageManagerBinaryError", () => {
  it("should be defined", () => {
    const error = new NoNpmPackageManagerBinaryError(pkg, pm, ">=6.0.0");

    expect(error.message).toBe("No npm binary found.");
    expect(error.details).toBe(
      "npm version >=6.0.0 is required. No npm binary found for package pkg.",
    );
  });
});
