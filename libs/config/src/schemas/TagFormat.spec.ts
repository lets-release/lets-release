import { ZodError } from "zod";

import { TagFormat } from "src/schemas/TagFormat";

describe("TagFormat", () => {
  it("should return valid tag format", async () => {
    await expect(TagFormat.parseAsync("v${version}")).resolves.toBe(
      "v${version}",
    );
  });

  it("should throw for invalid tag format", async () => {
    await expect(TagFormat.parseAsync("v ${version}")).rejects.toThrow(
      ZodError,
    );

    await expect(TagFormat.parseAsync("version")).rejects.toThrow(ZodError);
  });
});
