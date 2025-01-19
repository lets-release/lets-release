import { NoGitBinaryError } from "src/errors/NoGitBinaryError";

describe("NoGitBinaryError", () => {
  it("should be defined", () => {
    const error = new NoGitBinaryError("2.0.0");

    expect(error.message).toBe("No git binary found.");
    expect(error.details).toBe(
      "Git version 2.0.0 is required. No git binary found.",
    );
  });
});
