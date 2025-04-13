import { ReleaseCommit } from "src/schemas/ReleaseCommit";

describe("ReleaseCommit", () => {
  it("should validate release commit", () => {
    expect(
      ReleaseCommit.parse({
        assets: ["foo", "bar"],
        message: "hello world",
      }),
    ).toEqual({ assets: ["foo", "bar"], message: "hello world" });
  });

  it("should validate release commit with default message", () => {
    expect(
      ReleaseCommit.parse({
        assets: false,
      }),
    ).toEqual({
      assets: false,
      message:
        "chore(release): [skip ci]\n\n${releases.map(x => x.tag).toSorted().join('\\n')}",
    });
  });
});
