import { NoNpmPackageNameError } from "src/errors/NoNpmPackageNameError";

describe("NoNpmPackageNameError", () => {
  it("should be defined", () => {
    const error = new NoNpmPackageNameError();

    expect(error.message).toBe("Missing `name` property in `package.json`");
  });
});
