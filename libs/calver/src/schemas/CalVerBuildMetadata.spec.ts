import { ZodError } from "zod";

import {
  buildWithVariable,
  identifiers,
  invalidIdentifiers,
} from "src/__fixtures__/identifiers";
import { CalVerBuildMetadata } from "src/schemas/CalVerBuildMetadata";

describe("CalVerBuildMetadata", () => {
  it("should return valid build metadata", async () => {
    // Valid identifiers
    for (const value of identifiers) {
      await expect(CalVerBuildMetadata.parseAsync(value)).resolves.toBe(value);
    }

    // Valid build template string
    await expect(
      CalVerBuildMetadata.parseAsync(buildWithVariable),
    ).resolves.toBe(buildWithVariable);
  });

  it("should throw for invalid build metadata", async () => {
    // Invalid identifiers
    for (const value of invalidIdentifiers) {
      await expect(CalVerBuildMetadata.parseAsync(value)).rejects.toThrow(
        ZodError,
      );
    }
  });
});
