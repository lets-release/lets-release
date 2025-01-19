import { prereleaseNameWithVariable } from "src/__fixtures__/prereleases";
import { SemVerPrereleaseNameSpec } from "src/schemas/SemVerPrereleaseNameSpec";

describe("SemVerPrereleaseNameSpec", () => {
  it("should validate semver prerelease name spec", async () => {
    await expect(SemVerPrereleaseNameSpec.parseAsync(true)).resolves.toBe(true);

    await expect(
      SemVerPrereleaseNameSpec.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);

    await expect(
      SemVerPrereleaseNameSpec.parseAsync({
        npm: prereleaseNameWithVariable,
        pypi: true,
      }),
    ).resolves.toEqual({
      npm: prereleaseNameWithVariable,
      pypi: true,
    });
  });
});
