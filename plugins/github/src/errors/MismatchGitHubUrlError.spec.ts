import { MismatchGitHubUrlError } from "src/errors/MismatchGitHubUrlError";

describe("MismatchGitHubUrlError", () => {
  it("should be defined", () => {
    const error = new MismatchGitHubUrlError(
      "https://github.com",
      "https://github.com",
    );

    expect(error.message).toBe(
      "The git repository URL mismatches the GitHub URL.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "The **lets-release** `repositoryUrl` option must have the same repository name",
      ),
    );
  });
});
