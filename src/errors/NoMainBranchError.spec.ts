import { NoMainBranchError } from "src/errors/NoMainBranchError";

describe("NoMainBranchError", () => {
  it("should be defined", () => {
    const error = new NoMainBranchError();

    expect(error.message).toBe("No main branch found.");
    expect(error.details).toEqual(
      expect.stringContaining(
        "A main branch is required and must exist on the remote repository.",
      ),
    );
  });
});
