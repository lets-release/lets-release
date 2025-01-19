import { ReleaseResult } from "src/schemas/ReleaseResult";

describe("ReleaseResult", () => {
  it("should validate release result", () => {
    expect(ReleaseResult.parse(undefined)).toBeUndefined();

    expect(
      ReleaseResult.parse({
        name: "test",
      }),
    ).toEqual({
      name: "test",
    });
  });
});
