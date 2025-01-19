import { prereleaseNameWithVariable } from "src/__fixtures__/identifiers";
import { CalVerPrereleaseNameSpec } from "src/schemas/CalVerPrereleaseNameSpec";

describe("CalVerPrereleaseNameSpec", () => {
  it("should return valid calver prerelease name spec", async () => {
    // literal true
    await expect(CalVerPrereleaseNameSpec.parseAsync(true)).resolves.toBe(true);

    // template string
    await expect(
      CalVerPrereleaseNameSpec.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);

    // record of literal true or template string
    await expect(
      CalVerPrereleaseNameSpec.parseAsync({
        npm: prereleaseNameWithVariable,
        pypi: true,
      }),
    ).resolves.toEqual({
      npm: prereleaseNameWithVariable,
      pypi: true,
    });
  });
});
