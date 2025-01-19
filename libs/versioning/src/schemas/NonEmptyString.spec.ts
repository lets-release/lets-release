import { ZodError } from "zod";

import { NonEmptyString } from "src/schemas/NonEmptyString";

describe("NonEmptyString", () => {
  it("should validate values", async () => {
    await expect(NonEmptyString.parseAsync(true)).rejects.toThrow(ZodError);

    await expect(NonEmptyString.parseAsync("")).rejects.toThrow(ZodError);

    await expect(NonEmptyString.parseAsync("abcd")).resolves.toBe("abcd");

    await expect(NonEmptyString.parseAsync(" abcd ")).resolves.toBe("abcd");
  });
});
