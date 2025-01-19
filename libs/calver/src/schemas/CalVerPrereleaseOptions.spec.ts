import { ZodError } from "zod";

import { CalVerPrereleaseOptions } from "src/schemas/CalVerPrereleaseOptions";

describe("CalVerPrereleaseOptions", () => {
  it("should return valid calver prerelease options", async () => {
    await expect(CalVerPrereleaseOptions.parseAsync({})).resolves.toEqual({
      initialNumber: 1,
      ignoreZeroNumber: true,
      prefix: "-",
      suffix: ".",
    });
  });

  it("should throw for invalid calver prerelease options", async () => {
    await expect(
      CalVerPrereleaseOptions.parseAsync({
        prefix: "$",
      }),
    ).rejects.toThrow(ZodError);

    await expect(
      CalVerPrereleaseOptions.parseAsync({
        suffix: "$",
      }),
    ).rejects.toThrow(ZodError);
  });
});
