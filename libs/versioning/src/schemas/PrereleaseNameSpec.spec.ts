import { prereleaseNameWithVariable } from "src/__fixtures__/prereleases";
import { PrereleaseNameSpec } from "src/schemas/PrereleaseNameSpec";

describe("PrereleaseNameSpec", () => {
  it("should validate prerelease name spec", async () => {
    await expect(PrereleaseNameSpec.parseAsync(true)).resolves.toBe(true);

    await expect(
      PrereleaseNameSpec.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);

    await expect(
      PrereleaseNameSpec.parseAsync({
        npm: prereleaseNameWithVariable,
        pypi: true,
      }),
    ).resolves.toEqual({
      npm: prereleaseNameWithVariable,
      pypi: true,
    });
  });
});
