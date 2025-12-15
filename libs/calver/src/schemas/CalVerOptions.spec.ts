import { ZodError } from "zod";

import { VersioningScheme } from "@lets-release/versioning";

import { CalVerOptions } from "src/schemas/CalVerOptions";

const format = "YYYY-0M-0D";

describe("CalVerOptions", () => {
  it("should return valid calver options", async () => {
    await expect(
      CalVerOptions.parseAsync({
        scheme: VersioningScheme.CalVer,
        format,
      }),
    ).resolves.toEqual({
      scheme: VersioningScheme.CalVer,
      format,
      prerelease: {
        initialNumber: 1,
        ignoreZeroNumber: true,
      },
    });
  });

  it("should throw for invalid calver options", async () => {
    await expect(
      CalVerOptions.parseAsync({
        scheme: VersioningScheme.SemVer,
        format,
      }),
    ).rejects.toThrow(ZodError);

    await expect(
      CalVerOptions.parseAsync({
        scheme: VersioningScheme.CalVer,
      }),
    ).rejects.toThrow(ZodError);
  });
});
