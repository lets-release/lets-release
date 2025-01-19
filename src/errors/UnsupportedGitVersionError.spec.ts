import { UnsupportedGitVersionError } from "src/errors/UnsupportedGitVersionError";

describe("UnsupportedGitVersionError", () => {
  it("should be defined", () => {
    const error = new UnsupportedGitVersionError("2.0.0", "1.0.0");

    expect(error.message).toBe("Unsupported Git version.");
    expect(error.details).toBe("Git version 2.0.0 is required. Found 1.0.0.");
  });
});
