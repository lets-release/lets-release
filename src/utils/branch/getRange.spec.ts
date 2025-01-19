import { getRange } from "src/utils/branch/getRange";

describe("getRange", () => {
  it("should get range string without max", () => {
    expect(getRange("1.0.0")).toBe(">=1.0.0");
  });

  it("should get range string with max", () => {
    expect(getRange("1.0.0", "2.0.0")).toBe(">=1.0.0 <2.0.0");
  });
});
