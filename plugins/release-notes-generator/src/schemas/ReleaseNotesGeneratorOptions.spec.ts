import { ReleaseNotesGeneratorOptions } from "src/schemas/ReleaseNotesGeneratorOptions";

describe("ReleaseNotesGeneratorOptions", () => {
  it("should validate release notes generator options", () => {
    expect(ReleaseNotesGeneratorOptions.parse({})).toEqual({
      linkCompare: true,
      linkReferences: true,
    });
  });
});
