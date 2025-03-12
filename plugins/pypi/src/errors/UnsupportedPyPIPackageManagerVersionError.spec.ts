import { UnsupportedPyPIPackageManagerVersionError } from "src/errors/UnsupportedPyPIPackageManagerVersionError";
import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";
import { PyPIPackageManager } from "src/types/PyPIPackageManager";

const pkg = { project: { name: "pkg" } } as NormalizedPyProjectToml;
const pm = { name: "uv" } as PyPIPackageManager;
const requiredVersion = ">=0.2.0";
const currentVersion = "0.1.8";

describe("UnsupportedPyPIPackageManagerVersionError", () => {
  it("should be defined", () => {
    const error = new UnsupportedPyPIPackageManagerVersionError(
      pkg,
      pm,
      requiredVersion,
      currentVersion,
    );

    expect(error.message).toBe("Unsupported uv version.");
    expect(error.details).toBe(
      "uv version >=0.2.0 is required. Found 0.1.8 for package pkg.",
    );
  });
});
