import { DuplicatePackagesError } from "src/errors/DuplicatePackagesError";

describe("DuplicatePackagesError", () => {
  it("should be defined", () => {
    const duplicates = ["test-a", "test-b"];
    const error = new DuplicatePackagesError(duplicates);

    expect(error.message).toBe("Duplicate packages found.");
    expect(error.details).toBe(
      `The following packages are duplicated: ${duplicates.join(", ")}.`,
    );
  });
});
