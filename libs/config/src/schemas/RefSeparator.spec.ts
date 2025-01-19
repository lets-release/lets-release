import { ZodError } from "zod";

import { RefSeparator } from "src/schemas/RefSeparator";

describe("RefSeparator", () => {
  it("should return valid ref separator", async () => {
    await expect(RefSeparator.parseAsync("-")).resolves.toBe("-");

    await expect(RefSeparator.parseAsync(".")).resolves.toBe(".");
  });

  it("should throw for invalid ref separator", async () => {
    await expect(RefSeparator.parseAsync("~")).rejects.toThrow(ZodError);
  });
});
