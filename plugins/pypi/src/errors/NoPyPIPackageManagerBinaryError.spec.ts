import { NoPyPIPackageManagerBinaryError } from "src/errors/NoPyPIPackageManagerBinaryError";
import { NormalizedPyProjectToml } from "src/types/NormalizedPyProjectToml";
import { PyPIPackageManager } from "src/types/PyPIPackageManager";

const pkg = { project: { name: "pkg" } } as NormalizedPyProjectToml;
const pm = { name: "uv" } as PyPIPackageManager;

describe("NoPyPIPackageManagerBinaryError", () => {
  it("should be defined", () => {
    const error = new NoPyPIPackageManagerBinaryError(pkg, pm, ">=0.1.0");

    expect(error.message).toBe("No uv binary found.");
    expect(error.details).toBe(
      "uv version >=0.1.0 is required. No uv binary found for package pkg.",
    );
  });
});
