import { ZodError } from "zod";

import { VersioningScheme } from "@lets-release/versioning";

import { SemVerOptions } from "src/schemas/SemVerOptions";

describe("SemVerOptions", () => {
  it("should return valid semver options", async () => {
    await expect(
      SemVerOptions.parseAsync({
        scheme: VersioningScheme.SemVer,
      }),
    ).resolves.toEqual({
      scheme: VersioningScheme.SemVer,
      initialVersion: "1.0.0",
      prerelease: {
        initialNumber: 1,
        ignoreZeroNumber: true,
        prefix: "-",
        suffix: ".",
      },
    });
  });

  it("should throw for invalid semver options", async () => {
    await expect(
      SemVerOptions.parseAsync({
        scheme: VersioningScheme.CalVer,
      }),
    ).rejects.toThrow(ZodError);

    await expect(
      SemVerOptions.parseAsync({
        scheme: VersioningScheme.SemVer,
        initialVersion: "abcd",
      }),
    ).rejects.toThrow(ZodError);

    await expect(
      SemVerOptions.parseAsync({
        scheme: VersioningScheme.SemVer,
        initialVersion: "1.0.0-alpha.1",
      }),
    ).rejects.toThrow(ZodError);
  });
});
