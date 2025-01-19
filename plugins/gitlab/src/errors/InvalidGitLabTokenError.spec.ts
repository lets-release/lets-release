import { InvalidGitLabTokenError } from "src/errors/InvalidGitLabTokenError";

describe("InvalidGitLabTokenError", () => {
  it("should be defined", () => {
    const error = new InvalidGitLabTokenError("owner", "repo");

    expect(error.message).toBe("Invalid GitLab token.");
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure to set the `GL_TOKEN` or `GITLAB_TOKEN` environment variable",
      ),
    );
  });
});
