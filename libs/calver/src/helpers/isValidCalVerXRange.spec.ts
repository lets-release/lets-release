import { isValidCalVerXRange } from "src/helpers/isValidCalVerXRange";

describe("isValidCalVerXRange", () => {
  it("should return true for valid calver x range", () => {
    expect(isValidCalVerXRange("YY.minor.micro", "1.X.x")).toBe(true);

    expect(isValidCalVerXRange("YY.minor.micro", "1.2.x")).toBe(true);

    expect(isValidCalVerXRange("YYYY.MM.micro", "2021.2.x")).toBe(true);

    expect(isValidCalVerXRange("YYYY.MM.minor.micro", "2021.2.x")).toBe(true);

    expect(isValidCalVerXRange("YYYY.MM.minor.micro", "2021.2.x.x")).toBe(true);

    expect(isValidCalVerXRange("YYYY.MM.minor.micro", "2021.2.1.x")).toBe(true);
  });

  it("should return false for invalid calver x range", () => {
    expect(isValidCalVerXRange("Y.M", "x.x")).toBe(false);

    expect(isValidCalVerXRange("YY.minor.micro", "1.y.x")).toBe(false);

    expect(isValidCalVerXRange("YY.minor.micro", "1.2.x.x")).toBe(false);

    expect(isValidCalVerXRange("YYYY.MM", "2021.2.x")).toBe(false);

    expect(isValidCalVerXRange("YYYY.MM.micro", "2021.x.x")).toBe(false);

    expect(isValidCalVerXRange("YYYY.MM.micro", "2021.2.x.x")).toBe(false);
  });
});
