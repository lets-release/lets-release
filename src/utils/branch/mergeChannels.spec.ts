import { mergeChannels } from "src/utils/branch/mergeChannels";

describe("mergeChannels", () => {
  it("should merge channels", () => {
    expect(
      mergeChannels(
        {
          a: ["a1", "a2"],
          b: ["b1", "b2"],
        },
        {
          a: ["a2", "a3"],
          c: ["c1", "c2"],
        },
      ),
    ).toEqual({
      a: ["a1", "a2", "a3"],
      b: ["b1", "b2"],
      c: ["c1", "c2"],
    });
  });
});
