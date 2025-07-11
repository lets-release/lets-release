import { BumpVersionCommit } from "src/schemas/BumpVersionCommit";

describe("BumpVersionCommit", () => {
  it("should validate bump version commit", () => {
    expect(
      BumpVersionCommit.parse({
        subject: "feat: bump version to v1.0.0",
        body: "BREAKING CHANGE: major changes",
      }),
    ).toEqual({
      subject: "feat: bump version to v1.0.0",
      body: "BREAKING CHANGE: major changes",
    });
  });
});
