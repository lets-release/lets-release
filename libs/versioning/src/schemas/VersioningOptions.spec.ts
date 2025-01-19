import { ZodError } from "zod";

import { VersioningScheme } from "src/enums/VersioningScheme";
import { VersioningOptions } from "src/schemas/VersioningOptions";

describe("VersioningOptions", () => {
  it("should validate versioning options", async () => {
    await expect(
      VersioningOptions.parseAsync({ scheme: "scheme" }),
    ).rejects.toThrow(ZodError);

    await expect(
      VersioningOptions.parseAsync({ scheme: VersioningScheme.SemVer }),
    ).resolves.toEqual({ scheme: VersioningScheme.SemVer });

    await expect(
      VersioningOptions.parseAsync({ scheme: VersioningScheme.CalVer }),
    ).resolves.toEqual({ scheme: VersioningScheme.CalVer });
  });
});
