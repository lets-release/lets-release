import { ZodError } from "zod";

import { Range } from "src/schemas/Range";

describe("Range", () => {
  it("should return valid range", () => {
    expect(Range.parse("1.0.x")).toBe("1.0.x");

    expect(Range.parse("1.x.x")).toBe("1.x.x");

    expect(Range.parse("1.x")).toBe("1.x");
  });

  it("should throw for invalid range", () => {
    expect(() => Range.parse("1.x.1")).toThrow(ZodError);
  });
});
