import { ArtifactInfo } from "src/schemas/ArtifactInfo";

describe("ArtifactInfo", () => {
  it("should validate artifact info", () => {
    expect(
      ArtifactInfo.parse({
        name: "test",
      }),
    ).toEqual({
      name: "test",
    });
  });
});
