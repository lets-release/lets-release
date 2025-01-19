import { InvalidGitHubTokenError } from "src/errors/InvalidGitHubTokenError";

describe("InvalidGitHubTokenError", () => {
  it("should be defined", () => {
    const error = new InvalidGitHubTokenError("owner", "repo");

    expect(error.message).toBe("Invalid GitHub token.");
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure to set the `GH_TOKEN` or `GITHUB_TOKEN` environment variable",
      ),
    );
  });
});
