import { NoGitHubPermissionError } from "src/errors/NoGitHubPermissionError";

describe("NoGitHubPermissionError", () => {
  it("should be defined", () => {
    const error = new NoGitHubPermissionError("owner", "repo");

    expect(error.message).toBe(
      "The GitHub token doesn't allow to push on the repository owner/repo.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure the GitHub user associated with the token is an [owner]",
      ),
    );
  });
});
