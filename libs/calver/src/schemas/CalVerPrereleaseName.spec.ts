import { ZodError } from "zod";

import {
  identifiers,
  invalidIdentifiers,
  prereleaseNameWithVariable,
} from "src/__fixtures__/identifiers";
import { CalVerPrereleaseName } from "src/schemas/CalVerPrereleaseName";

describe("CalVerPrereleaseName", () => {
  it("should return valid calver prerelease name", async () => {
    // Valid identifiers
    for (const value of identifiers) {
      await expect(CalVerPrereleaseName.parseAsync(value)).resolves.toBe(value);
    }

    // Valid prerelease name template string
    await expect(
      CalVerPrereleaseName.parseAsync(prereleaseNameWithVariable),
    ).resolves.toBe(prereleaseNameWithVariable);
  });

  it("should throw for invalid calver prerelease name", async () => {
    // Invalid identifiers
    for (const value of invalidIdentifiers) {
      await expect(CalVerPrereleaseName.parseAsync(value)).rejects.toThrow(
        ZodError,
      );
    }
  });
});
