import { describe, expect, it } from "vitest";

import { getNextCalVerMajorVersion } from "src/helpers/getNextCalVerMajorVersion";

describe("getNextCalVerMajorVersion", () => {
  describe("year only formats", () => {
    it("should increment YYYY format", () => {
      const result = getNextCalVerMajorVersion("YYYY", "2024");
      expect(result).toBe("2025");
    });

    it("should increment YY format", () => {
      const result = getNextCalVerMajorVersion("YY", "24");
      expect(result).toBe("25");
    });

    it("should increment YYYY with minor and micro", () => {
      const result = getNextCalVerMajorVersion("YYYY.MINOR.MICRO", "2024.1.2");
      expect(result).toBe("2025.0.0");
    });

    it("should increment YY with minor and micro", () => {
      const result = getNextCalVerMajorVersion("YY.MINOR.MICRO", "24.5.3");
      expect(result).toBe("25.0.0");
    });
  });

  describe("year-week formats", () => {
    it("should increment YYYY.0W format (zero-padded week)", () => {
      const result = getNextCalVerMajorVersion("YYYY.0W", "2024.01");
      expect(result).toBe("2024.02");
    });

    it("should increment YY.0W format", () => {
      const result = getNextCalVerMajorVersion("YY.0W", "24.01");
      expect(result).toBe("24.02");
    });

    it("should increment YYYY.WW format (non-padded week)", () => {
      const result = getNextCalVerMajorVersion("YYYY.WW", "2024.1");
      expect(result).toBe("2024.2");
    });

    it("should increment YYYY.0W with minor and micro", () => {
      const result = getNextCalVerMajorVersion(
        "YYYY.0W.MINOR.MICRO",
        "2024.01.3.4",
      );
      expect(result).toBe("2024.02.0.0");
    });

    it("should handle week overflow to next year", () => {
      const result = getNextCalVerMajorVersion("YYYY.WW", "2024.52");
      // Week 52 + 1 week = week 1 of 2025
      expect(result).toMatch(/^2025\./);
    });
  });

  describe("year-month formats", () => {
    it("should increment YYYY.0M format (zero-padded month)", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M", "2024.01");
      expect(result).toBe("2024.02");
    });

    it("should increment YY.0M format", () => {
      const result = getNextCalVerMajorVersion("YY.0M", "24.01");
      expect(result).toBe("24.02");
    });

    it("should increment YYYY.MM format (non-padded month)", () => {
      const result = getNextCalVerMajorVersion("YYYY.MM", "2024.1");
      expect(result).toBe("2024.2");
    });

    it("should increment YYYY.0M with minor and micro", () => {
      const result = getNextCalVerMajorVersion(
        "YYYY.0M.MINOR.MICRO",
        "2024.01.2.3",
      );
      expect(result).toBe("2024.02.0.0");
    });

    it("should handle month overflow to next year", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M", "2024.12");
      expect(result).toBe("2025.01");
    });
  });

  describe("year-month-day formats", () => {
    it("should increment YYYY.0M.0D format (zero-padded day)", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M.0D", "2024.01.15");
      expect(result).toBe("2024.01.16");
    });

    it("should increment YY.0M.0D format", () => {
      const result = getNextCalVerMajorVersion("YY.0M.0D", "24.01.15");
      expect(result).toBe("24.01.16");
    });

    it("should increment YYYY.0M.DD format (non-padded day)", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M.DD", "2024.01.15");
      expect(result).toBe("2024.01.16");
    });

    it("should increment YYYY.0M.0D with minor and micro", () => {
      const result = getNextCalVerMajorVersion(
        "YYYY.0M.0D.MINOR.MICRO",
        "2024.01.15.1.2",
      );
      expect(result).toBe("2024.01.16.0.0");
    });

    it("should handle day overflow to next month", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M.0D", "2024.01.31");
      expect(result).toBe("2024.02.01");
    });

    it("should handle leap year day overflow", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M.0D", "2024.02.29");
      expect(result).toBe("2024.03.01");
    });

    it("should handle non-leap year day overflow", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M.0D", "2023.02.28");
      expect(result).toBe("2023.03.01");
    });

    it("should handle month and year overflow", () => {
      const result = getNextCalVerMajorVersion("YYYY.0M.0D", "2024.12.31");
      expect(result).toBe("2025.01.01");
    });
  });

  describe("edge cases", () => {
    it("should handle 0Y format (zero-padded two-digit year)", () => {
      const result = getNextCalVerMajorVersion("0Y", "24");
      expect(result).toBe("25");
    });

    it("should handle single digit week with zero padding", () => {
      const result = getNextCalVerMajorVersion("YYYY.0W", "2024.01");
      expect(result).toBe("2024.02");
    });

    it("should handle YY with year 99 to 100", () => {
      const result = getNextCalVerMajorVersion("YY", "99");
      // 99 -> 2099 + 1 year -> 2100 -> 100
      expect(result).toBe("100");
    });

    it("should handle YY.0M with year transition", () => {
      const result = getNextCalVerMajorVersion("YY.0M", "24.12");
      expect(result).toBe("25.01");
    });

    it("should handle week 53 in year", () => {
      const result = getNextCalVerMajorVersion("YYYY.0W", "2020.53");
      // Week 53 + 1 week should go into next year
      expect(result).toMatch(/^2021\./);
    });
  });
});
