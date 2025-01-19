import { LetsReleaseError } from "src/errors/LetsReleaseError";

const message = "Test error";
const details = "Test details";

class TestError extends LetsReleaseError {
  readonly message = message;
  readonly details = details;
}

describe("LetsReleaseError", () => {
  it("should create error", () => {
    const error = new TestError();

    expect(error.message).toBe(message);
    expect(error.details).toBe(details);
  });
});
