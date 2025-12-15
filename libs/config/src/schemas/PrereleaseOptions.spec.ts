import { PrereleaseOptions } from "src/schemas/PrereleaseOptions";

describe("PrereleaseOptions", () => {
  it("should validate prerelease options", () => {
    const obj = {
      name: "alpha",
    };

    expect(PrereleaseOptions.parse(obj)).toEqual(obj);
  });
});
