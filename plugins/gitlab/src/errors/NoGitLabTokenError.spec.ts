import { NoGitLabTokenError } from "src/errors/NoGitLabTokenError";

describe("NoGitLabTokenError", () => {
  it("should be defined", () => {
    const error = new NoGitLabTokenError("owner", "repo");

    expect(error.message).toBe("No GitLab token specified.");
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure to create a [GitLab personal access token]",
      ),
    );
  });
});
