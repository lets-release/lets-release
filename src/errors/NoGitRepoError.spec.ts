import { NoGitRepoError } from "src/errors/NoGitRepoError";
import { name } from "src/program";

describe("NoGitRepoError", () => {
  it("should be defined", () => {
    const error = new NoGitRepoError("cwd");

    expect(error.message).toBe("Not running from a git repository.");
    expect(error.details).toEqual(
      expect.stringContaining(
        `The \`${name}\` command must be executed from a Git repository.`,
      ),
    );
  });
});
