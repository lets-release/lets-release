import { ZodError } from "zod";

import {
  prereleaseNameWithVariable,
  prereleaseNames,
} from "src/__fixtures__/prereleases";
import { SemVerPrereleaseName } from "src/schemas/SemVerPrereleaseName";

describe("SemVerPrereleaseName", () => {
  it("should return valid semver prerelease name", async () => {
    for (const { value, isValid } of prereleaseNames) {
      if (value && isValid) {
        await expect(
          SemVerPrereleaseName.parseAsync(value),
          value,
        ).resolves.toBe(value);
      }
    }

    await expect(
      SemVerPrereleaseName.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);
  });

  it("should throw for invalid semver prerelease name", async () => {
    for (const { value, isValid } of prereleaseNames) {
      if (!value || !isValid) {
        await expect(
          SemVerPrereleaseName.parseAsync(value),
          value,
        ).rejects.toThrow(ZodError);
      }
    }
  });
});
