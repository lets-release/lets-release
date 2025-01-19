import { ConventionalChangelogOptions } from "src/schemas/ConventionalChangelogOptions";

describe("ConventionalChangelogOptions", () => {
  it("should validate conventional changelog options", () => {
    const obj = {
      preset: "angular",
      presetConfig: {},
    };

    expect(ConventionalChangelogOptions.parse(obj)).toEqual(obj);
  });
});
