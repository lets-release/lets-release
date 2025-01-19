import { loadModule } from "@lets-release/config";

import { releaseRules } from "src/__fixtures__/releaseRules";
import { loadReleaseRules } from "src/helpers/loadReleaseRules";

vi.mock("@lets-release/config");

vi.mocked(loadModule).mockResolvedValue(releaseRules);

describe("loadReleaseRules", () => {
  it("should return undefined if options.releaseRules is nil", async () => {
    await expect(loadReleaseRules({})).resolves.toBeUndefined();
  });

  it("should load release rules from module if options.releaseRules is a string", async () => {
    await expect(
      loadReleaseRules({
        releaseRules: "./src/__fixtures__/releaseRules.ts",
      }),
    ).resolves.toEqual(releaseRules);
  });

  it("should return options.releaseRules as release rules", async () => {
    await expect(
      loadReleaseRules({
        releaseRules,
      }),
    ).resolves.toEqual(releaseRules);
  });
});
