import { ZodError } from "zod";

import {
  prereleaseNameWithVariable,
  prereleaseNames,
} from "src/__fixtures__/prereleases";
import { PrereleaseName } from "src/schemas/PrereleaseName";

describe("PrereleaseName", () => {
  const validPrereleaseNames = prereleaseNames.filter(
    (pr) => pr.isValid && pr.value,
  );
  const invalidPrereleaseNames = prereleaseNames.filter(
    (pr) => !pr.isValid || !pr.value,
  );

  it("should return valid prerelease name with variable", async () => {
    await expect(
      PrereleaseName.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);
  });

  it.each(validPrereleaseNames)(
    "should return valid prerelease name: $value",
    async ({ value }) => {
      await expect(PrereleaseName.parseAsync(value), value).resolves.toBe(
        value,
      );
    },
  );

  it.each(invalidPrereleaseNames)(
    "should throw for invalid prerelease name: $value",
    async ({ value }) => {
      await expect(PrereleaseName.parseAsync(value), value).rejects.toThrow(
        ZodError,
      );
    },
  );
});
