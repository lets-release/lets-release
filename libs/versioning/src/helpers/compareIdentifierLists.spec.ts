import { compareIdentifierLists } from "src/helpers/compareIdentifierLists";

describe("compareIdentifierLists", () => {
  it("should compare identifier lists", () => {
    expect(compareIdentifierLists([], [])).toBe(0);

    expect(compareIdentifierLists([1], [1])).toBe(0);

    expect(compareIdentifierLists([1, 2], [1])).toBe(1);

    expect(compareIdentifierLists([1], [1, 2])).toBe(-1);

    expect(compareIdentifierLists([1, 2], [1, 2])).toBe(0);

    expect(compareIdentifierLists([1, 2], [1, 3])).toBe(-1);

    expect(compareIdentifierLists([1, 3], [1, 2])).toBe(1);
  });
});
