import { NoGitHubTokenError } from "src/errors/NoGitHubTokenError";

describe("NoGitHubTokenError", () => {
  it("should be defined", () => {
    const error = new NoGitHubTokenError("owner", "repo");

    expect(error.message).toBe("No GitHub token specified.");
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure to create a [GitHub personal token]",
      ),
    );
  });
});
