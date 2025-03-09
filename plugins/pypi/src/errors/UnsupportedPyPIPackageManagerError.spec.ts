import { UnsupportedPyPIPackageManagerError } from "src/errors/UnsupportedPyPIPackageManagerError";

describe("UnsupportedPyPIPackageManagerError", () => {
  it("should be defined", () => {
    const error = new UnsupportedPyPIPackageManagerError("test");

    expect(error.message).toBe("Unsupported PyPI package manager");
    expect(error.details).toBe(
      "The package manager for `test` is not supported.\n\nSupported package managers are: uv, and poetry.",
    );
  });
});
