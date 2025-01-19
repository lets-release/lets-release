import { NeedAuthError } from "src/errors/NeedAuthError";

describe("NeedAuthError", () => {
  it("should be defined", () => {
    const error = new NeedAuthError("value");

    expect(error.message).toBe("Need auth");
    expect(error.details).toBe(
      "You need to authorize this machine to publish to the registry `value`.",
    );
  });
});
