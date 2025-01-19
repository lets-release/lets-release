import { VersioningPrereleaseOptions } from "src/schemas/VersioningPrereleaseOptions";

describe("VersioningPrereleaseOptions", () => {
  it("should validate versioning prerelease options", async () => {
    await expect(
      VersioningPrereleaseOptions.parseAsync({ initialNumber: 0 }),
    ).resolves.toEqual({ initialNumber: 0, ignoreZeroNumber: true });

    await expect(
      VersioningPrereleaseOptions.parseAsync({ initialNumber: 1 }),
    ).resolves.toEqual({ initialNumber: 1, ignoreZeroNumber: true });

    await expect(
      VersioningPrereleaseOptions.parseAsync({ ignoreZeroNumber: false }),
    ).resolves.toEqual({ initialNumber: 1, ignoreZeroNumber: false });
  });
});
