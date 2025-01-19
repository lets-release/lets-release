import { UnsupportedNodeVersionError } from "src/errors/UnsupportedNodeVersionError";

describe("UnsupportedNodeVersionError", () => {
  it("should be defined", () => {
    const error = new UnsupportedNodeVersionError("2.0.0", "1.0.0");

    expect(error.message).toBe("Unsupported Node.js version.");
    expect(error.details).toEqual(
      expect.stringMatching(/Node.js version .+ is required\. Found .+/),
    );
  });
});
