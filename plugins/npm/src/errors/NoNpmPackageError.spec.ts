import { NoNpmPackageError } from "src/errors/NoNpmPackageError";

describe("NoNpmPackageError", () => {
  it("should be defined", () => {
    const error = new NoNpmPackageError();

    expect(error.message).toBe("Missing `package.json` file");
  });
});
