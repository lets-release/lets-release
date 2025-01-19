import { isValidCalVerMajorXRange } from "src/helpers/isValidCalVerMajorXRange";

describe("isValidCalVerMajorXRange", () => {
  it("should return true for valid calver major x range", () => {
    expect(isValidCalVerMajorXRange("YY.minor.micro", "1.X.x")).toBe(true);

    expect(isValidCalVerMajorXRange("YYYY.MM.micro", "2021.1.x")).toBe(true);

    expect(isValidCalVerMajorXRange("YYYY.MM.minor.micro", "2021.2.x")).toBe(
      true,
    );

    expect(isValidCalVerMajorXRange("YYYY.MM.minor.micro", "2021.2.x.x")).toBe(
      true,
    );
  });

  it("should return false for invalid calver major x range", () => {
    expect(isValidCalVerMajorXRange("Y.M", "x.x")).toBe(false);

    expect(isValidCalVerMajorXRange("YY.minor.micro", "1.2.x")).toBe(false);

    expect(isValidCalVerMajorXRange("YYYY.MM.micro", "2021.x.x")).toBe(false);

    expect(isValidCalVerMajorXRange("YYYY.MM.minor.micro", "2021.2.1.x")).toBe(
      false,
    );
  });
});
