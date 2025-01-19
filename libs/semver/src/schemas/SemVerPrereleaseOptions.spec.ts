import { ZodError } from "zod";

import { SemVerPrereleaseOptions } from "src/schemas/SemVerPrereleaseOptions";

describe("SemVerPrereleaseOptions", () => {
  it("should return valid semver prerelease options", async () => {
    await expect(SemVerPrereleaseOptions.parseAsync({})).resolves.toEqual({
      initialNumber: 1,
      ignoreZeroNumber: true,
      prefix: "-",
      suffix: ".",
    });
  });

  it("should throw for invalid semver prerelease options", async () => {
    await expect(
      SemVerPrereleaseOptions.parseAsync({
        prefix: "$",
      }),
    ).rejects.toThrow(ZodError);

    await expect(
      SemVerPrereleaseOptions.parseAsync({
        suffix: "$",
      }),
    ).rejects.toThrow(ZodError);
  });
});
