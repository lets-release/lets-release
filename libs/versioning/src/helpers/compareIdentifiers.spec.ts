import { compareIdentifiers } from "src/helpers/compareIdentifiers";

describe("compareIdentifiers", () => {
  it("should compare identifiers", () => {
    expect(compareIdentifiers(1, 1)).toBe(0);

    expect(compareIdentifiers("1", "1")).toBe(0);

    expect(compareIdentifiers(1, "1")).toBe(-1);

    expect(compareIdentifiers("1", 1)).toBe(1);

    expect(compareIdentifiers(1, 2)).toBe(-1);

    expect(compareIdentifiers(2, 1)).toBe(1);

    expect(compareIdentifiers("1", "2")).toBe(-1);

    expect(compareIdentifiers("2", "1")).toBe(1);
  });
});
