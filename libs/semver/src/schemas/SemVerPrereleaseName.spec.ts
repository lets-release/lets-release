import { ZodError } from "zod";

import {
  prereleaseNameWithVariable,
  prereleaseNames,
} from "src/__fixtures__/prereleases";
import { SemVerPrereleaseName } from "src/schemas/SemVerPrereleaseName";

describe("SemVerPrereleaseName", () => {
  const validPrereleaseNames = prereleaseNames.filter(
    (pr) => pr.isValid && pr.value,
  );
  const invalidPrereleaseNames = prereleaseNames.filter(
    (pr) => !pr.isValid || !pr.value,
  );

  it("should return valida semver prerelease name with variable", async () => {
    await expect(
      SemVerPrereleaseName.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);
  });

  it.each(validPrereleaseNames)(
    "should return valid semver prerelease name: $value",
    async ({ value }) => {
      await expect(SemVerPrereleaseName.parseAsync(value), value).resolves.toBe(
        value,
      );
    },
  );

  it.each(invalidPrereleaseNames)(
    "should throw for invalid semver prerelease name: $value",
    async ({ value }) => {
      await expect(
        SemVerPrereleaseName.parseAsync(value),
        value,
      ).rejects.toThrow(ZodError);
    },
  );
});
