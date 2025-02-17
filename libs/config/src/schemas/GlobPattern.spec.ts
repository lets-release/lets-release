import { GlobPattern } from "src/schemas/GlobPattern";

describe("GlobPattern", () => {
  it("should return valid glob pattern", () => {
    expect(GlobPattern.parse("test")).toEqual("test");
    expect(GlobPattern.parse(["test"])).toEqual(["test"]);
  });
});
