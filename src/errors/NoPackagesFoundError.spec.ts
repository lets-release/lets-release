import { NoPackagesFoundError } from "src/errors/NoPackagesFoundError";

describe("NoPackagesFoundError", () => {
  it("should be defined", () => {
    const error = new NoPackagesFoundError();

    expect(error.message).toBe("No packages found.");
    expect(error.details).toBe("No packages were found in the repository.");
  });
});
