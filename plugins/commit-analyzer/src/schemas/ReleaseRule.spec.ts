import { ReleaseRule } from "src/schemas/ReleaseRule";

describe("ReleaseRule", () => {
  it("should validate release rule", () => {
    const obj = {
      release: "minor",
    };

    expect(ReleaseRule.parse(obj)).toEqual(obj);
  });
});
