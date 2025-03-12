import { NoPyPIPackageNameError } from "src/errors/NoPyPIPackageNameError";

describe("NoPyPIPackageNameError", () => {
  it("should be defined", () => {
    const error = new NoPyPIPackageNameError();

    expect(error.message).toBe(
      "Missing `name` property in [project] table of `pyproject.toml`",
    );
  });
});
