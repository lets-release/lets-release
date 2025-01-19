import { NoPackageNameError } from "src/errors/NoPackageNameError";

describe("NoPackageNameError", () => {
  it("should be defined", () => {
    const error = new NoPackageNameError();

    expect(error.message).toBe("Missing `name` property in `package.json`");
  });
});
