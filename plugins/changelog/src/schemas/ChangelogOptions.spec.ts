import { ChangelogOptions } from "src/schemas/ChangelogOptions";

describe("ChangelogOptions", () => {
  it("should validate changelog options", () => {
    expect(ChangelogOptions.parse({})).toEqual({
      changelogFile: "CHANGELOG.md",
    });
  });
});
