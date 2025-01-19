import { ZodError } from "zod";

import { invalidFormats, validFormats } from "src/__fixtures__/formats";
import { CalVerFormat } from "src/schemas/CalVerFormat";

describe("CalVerFormat", () => {
  it("should return valid calver format", async () => {
    for (const format of Object.keys(validFormats)) {
      await expect(CalVerFormat.parseAsync(format)).resolves.toBe(format);
    }
  });

  it("should throw for invalid calver format", async () => {
    for (const format of invalidFormats) {
      await expect(CalVerFormat.parseAsync(format)).rejects.toThrow(ZodError);
    }
  });
});
