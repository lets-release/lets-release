import { InvalidGitLabUrlError } from "src/errors/InvalidGitLabUrlError";

describe("InvalidGitLabUrlError", () => {
  it("should be defined", () => {
    const error = new InvalidGitLabUrlError();

    expect(error.message).toBe(
      "The git repository URL is not a valid GitLab URL.",
    );
    expect(error.details).toEqual(
      expect.stringContaining(
        "The **lets-release** `repositoryUrl` option must a valid GitLab URL",
      ),
    );
  });
});
