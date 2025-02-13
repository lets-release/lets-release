import { UnsupportedNpmPackageManagerError } from "src/errors/UnsupportedNpmPackageManagerError";

describe("UnsupportedNpmPackageManagerError", () => {
  it("should be defined", () => {
    const error = new UnsupportedNpmPackageManagerError("test");

    expect(error.message).toBe("Unsupported npm package manager");
    expect(error.details).toContain(
      "The package manager for `test` is not supported.",
    );
  });
});
