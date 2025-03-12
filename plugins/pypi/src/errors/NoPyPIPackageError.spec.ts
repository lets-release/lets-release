import { NoPyPIPackageError } from "src/errors/NoPyPIPackageError";

describe("NoPyPIPackageError", () => {
  it("should be defined", () => {
    const error = new NoPyPIPackageError();

    expect(error.message).toBe("Missing `pyproject.toml` file");
  });
});
