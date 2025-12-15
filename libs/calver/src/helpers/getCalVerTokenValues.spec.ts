import { getCalVerTokenValues } from "src/helpers/getCalVerTokenValues";

describe("getCalVerTokenValues", () => {
  describe("calendar year formats", () => {
    it("should return correct values for YYYY format", () => {
      const result = getCalVerTokenValues("YYYY", "2025-03-15");

      expect(result).toEqual({
        year: 2025,
        week: 11,
        month: 3,
        day: 15,
        minor: 0,
        micro: 0,
      });
    });

    it("should return correct values for YY format", () => {
      const result = getCalVerTokenValues("0Y", "2025-03-15");

      expect(result).toEqual({
        year: 25,
        week: 11,
        month: 3,
        day: 15,
        minor: 0,
        micro: 0,
      });
    });

    it("should return correct values for Y format", () => {
      const result = getCalVerTokenValues("YY", "2025-03-15");

      expect(result).toEqual({
        year: 25,
        week: 11,
        month: 3,
        day: 15,
        minor: 0,
        micro: 0,
      });
    });

    it("should return correct values for YYYY.MM format", () => {
      const result = getCalVerTokenValues("YYYY.0M", "2025-03-15");

      expect(result).toEqual({
        year: 2025,
        week: 11,
        month: 3,
        day: 15,
        minor: 0,
        micro: 0,
      });
    });

    it("should return correct values for YYYY.MM.DD format", () => {
      const result = getCalVerTokenValues("YYYY.0M.0D", "2025-03-15");

      expect(result).toEqual({
        year: 2025,
        week: 11,
        month: 3,
        day: 15,
        minor: 0,
        micro: 0,
      });
    });
  });

  describe("ISO week numbering year formats", () => {
    it("should return correct ISO week year for YYYY.WW format", () => {
      // Date in week 1 of 2025 (ISO week year 2025)
      const result = getCalVerTokenValues("YYYY.0W", "2025-01-06");

      expect(result).toEqual({
        year: 2025,
        week: 2,
        month: 1,
        day: 6,
        minor: 0,
        micro: 0,
      });
    });

    it("should return correct ISO week year for YY.WW format", () => {
      const result = getCalVerTokenValues("0Y.0W", "2025-01-06");

      expect(result).toEqual({
        year: 25,
        week: 2,
        month: 1,
        day: 6,
        minor: 0,
        micro: 0,
      });
    });

    it("should return correct ISO week year for Y.WW format", () => {
      const result = getCalVerTokenValues("YY.0W", "2025-01-06");

      expect(result).toEqual({
        year: 25,
        week: 2,
        month: 1,
        day: 6,
        minor: 0,
        micro: 0,
      });
    });

    it("should handle edge case where calendar year differs from ISO week year", () => {
      // December 29, 2025 is in ISO week 1 of 2026
      const result = getCalVerTokenValues("YYYY.0W", "2025-12-29");

      // ISO week numbering year should be 2026
      expect(result.year).toBe(2026);
      expect(result.week).toBe(1);
    });

    it("should handle early January dates in ISO week year", () => {
      // January 1, 2024 is in ISO week 1 of 2024
      const result = getCalVerTokenValues("YYYY.0W", "2024-01-01");

      // ISO week numbering year should be 2024
      expect(result.year).toBe(2024);
      expect(result.week).toBe(1);
    });
  });

  describe("default date parameter", () => {
    it("should use current date when date parameter is not provided", () => {
      const result = getCalVerTokenValues("YYYY.0M.0D");

      // Should return valid numbers
      expect(typeof result.year).toBe("number");
      expect(typeof result.week).toBe("number");
      expect(typeof result.month).toBe("number");
      expect(typeof result.day).toBe("number");
      expect(result.minor).toBe(0);
      expect(result.micro).toBe(0);

      // Year should be reasonable (not 0 or negative)
      expect(result.year).toBeGreaterThan(2020);
      expect(result.month).toBeGreaterThanOrEqual(1);
      expect(result.month).toBeLessThanOrEqual(12);
      expect(result.day).toBeGreaterThanOrEqual(1);
      expect(result.day).toBeLessThanOrEqual(31);
    });
  });

  describe("various formats", () => {
    it("should handle format with single digit month (M)", () => {
      const result = getCalVerTokenValues("YYYY.MM", "2025-09-05");

      expect(result.year).toBe(2025);
      expect(result.month).toBe(9);
    });

    it("should handle format with single digit day (D)", () => {
      const result = getCalVerTokenValues("YYYY.0M.DD", "2025-09-05");

      expect(result.year).toBe(2025);
      expect(result.month).toBe(9);
      expect(result.day).toBe(5);
    });

    it("should handle format with single digit week (W)", () => {
      const result = getCalVerTokenValues("YYYY.WW", "2025-02-03");

      expect(result.year).toBe(2025);
      expect(result.week).toBe(6);
    });
  });

  describe("edge cases", () => {
    it("should handle leap year date", () => {
      const result = getCalVerTokenValues("YYYY.0M.0D", "2024-02-29");

      expect(result).toEqual({
        year: 2024,
        week: 9,
        month: 2,
        day: 29,
        minor: 0,
        micro: 0,
      });
    });

    it("should handle year 2000", () => {
      const result = getCalVerTokenValues("YYYY.0M.0D", "2000-01-01");

      expect(result.year).toBe(2000);
      expect(result.month).toBe(1);
      expect(result.day).toBe(1);
    });

    it("should always return minor and micro as 0", () => {
      const result = getCalVerTokenValues("YYYY.0M.0D", "2025-12-31");

      expect(result.minor).toBe(0);
      expect(result.micro).toBe(0);
    });
  });

  describe("different separators", () => {
    it("should handle hyphen separator", () => {
      const result = getCalVerTokenValues("YYYY-0M-0D", "2025-03-15");

      expect(result.year).toBe(2025);
      expect(result.month).toBe(3);
      expect(result.day).toBe(15);
    });
  });
});
