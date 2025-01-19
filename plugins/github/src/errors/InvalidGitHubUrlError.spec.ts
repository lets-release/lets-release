import { InvalidGitHubUrlError } from "src/errors/InvalidGitHubUrlError";

describe("InvalidGitHubUrlError", () => {
  it("should be defined", () => {
    const error = new InvalidGitHubUrlError();

    expect(error.message).toBe(
      "The git repository URL is not a valid GitHub URL.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "The **lets-release** `repositoryUrl` option must a valid GitHub URL",
      ),
    );
  });
});
