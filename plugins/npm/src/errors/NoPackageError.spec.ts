import { NoPackageError } from "src/errors/NoPackageError";

describe("NoPackageError", () => {
  it("should be defined", () => {
    const error = new NoPackageError();

    expect(error.message).toBe("Missing `package.json` file");
  });
});
