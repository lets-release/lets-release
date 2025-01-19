import { isSemVerSatisfiedRange } from "src/helpers/isSemVerSatisfiedRange";

describe("isSemVerSatisfiedRange", () => {
  it("should return true if version is in range", () => {
    expect(isSemVerSatisfiedRange("1.0.0-alpha.1", "1.0.0")).toBe(true);

    expect(isSemVerSatisfiedRange("1.0.0", "1.0.0")).toBe(true);

    expect(isSemVerSatisfiedRange("1.0.0", "0.0.0", "2.0.0")).toBe(true);
  });

  it("should return false if version is not in range", () => {
    expect(isSemVerSatisfiedRange("1.10.0", "2.0.0")).toBe(false);

    expect(isSemVerSatisfiedRange("2.0.0", "1.0.0", "2.0.0")).toBe(false);
  });
});
