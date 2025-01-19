import { RepoNotFoundError } from "src/errors/RepoNotFoundError";

describe("RepoNotFoundError", () => {
  it("should be defined", () => {
    const error = new RepoNotFoundError("owner", "repo");

    expect(error.message).toBe("The repository owner/repo doesn't exist.");
    expect(error.details).toEqual(
      expect.stringContaining(
        "The **lets-release** `repositoryUrl` option must refer to your GitHub repository.",
      ),
    );
  });
});
