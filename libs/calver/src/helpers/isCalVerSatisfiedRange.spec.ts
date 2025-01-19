import { isCalVerSatisfiedRange } from "src/helpers/isCalVerSatisfiedRange";

const format = "YYYY.MINOR.MICRO";

describe("isCalVerSatisfiedRange", () => {
  it("should return true if version is in range", () => {
    expect(isCalVerSatisfiedRange(format, "2001.0.0-alpha.1", "2001.0.0")).toBe(
      true,
    );

    expect(isCalVerSatisfiedRange(format, "2001.0.0", "2001.0.0")).toBe(true);

    expect(
      isCalVerSatisfiedRange(format, "2001.0.0", "2000.0.0", "2002.0.0"),
    ).toBe(true);
  });

  it("should return false if version is not in range", () => {
    expect(isCalVerSatisfiedRange(format, "2001.10.0", "2002.0.0")).toBe(false);

    expect(
      isCalVerSatisfiedRange(format, "2002.0.0", "2001.0.0", "2002.0.0"),
    ).toBe(false);
  });
});
