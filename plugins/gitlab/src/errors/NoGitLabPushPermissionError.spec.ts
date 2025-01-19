import { NoGitLabPushPermissionError } from "src/errors/NoGitLabPushPermissionError";

describe("NoGitLabPushPermissionError", () => {
  it("should be defined", () => {
    const error = new NoGitLabPushPermissionError("owner", "repo");

    expect(error.message).toBe(
      "The GitLab token doesn't allow to push on the repository owner/repo.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure the GitLab user associated with the token has the [permission to push]",
      ),
    );
  });
});
