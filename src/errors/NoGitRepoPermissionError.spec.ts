import { NoGitRepoPermissionError } from "src/errors/NoGitRepoPermissionError";

describe("NoGitRepoPermissionError", () => {
  it("should be defined", () => {
    const error = new NoGitRepoPermissionError(
      "https://github.com/owner/repo.git",
      "branch",
      new Error("Unknown"),
    );

    expect(error.message).toBe("Cannot push to the Git repository.");
    expect(error.details).toEqual(
      expect.stringContaining("**lets-release** cannot push the version tag"),
    );
  });
});
