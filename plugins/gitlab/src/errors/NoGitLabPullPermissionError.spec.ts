import { NoGitLabPullPermissionError } from "src/errors/NoGitLabPullPermissionError";

describe("NoGitLabPullPermissionError", () => {
  it("should be defined", () => {
    const error = new NoGitLabPullPermissionError("owner", "repo");

    expect(error.message).toBe(
      "The GitLab token doesn't allow to pull from the repository owner/repo.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "Please make sure the GitLab user associated with the token has the [permission to pull]",
      ),
    );
  });
});
