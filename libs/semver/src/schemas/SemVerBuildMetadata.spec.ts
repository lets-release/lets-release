import { ZodError } from "zod";

import { buildWithVariable, builds } from "src/__fixtures__/builds";
import { SemVerBuildMetadata } from "src/schemas/SemVerBuildMetadata";

describe("SemVerBuildMetadata", () => {
  it("should return valid build metadata", async () => {
    for (const { value, isValid } of builds) {
      if (isValid) {
        await expect(
          SemVerBuildMetadata.parseAsync(value),
          value,
        ).resolves.toBe(value);
      }
    }

    await expect(
      SemVerBuildMetadata.parseAsync(buildWithVariable),
    ).resolves.toBe(buildWithVariable);
  });

  it("should throw for invalid build metadata", async () => {
    for (const { value, isValid } of builds) {
      if (!isValid) {
        await expect(
          SemVerBuildMetadata.parseAsync(value),
          value,
        ).rejects.toThrow(ZodError);
      }
    }
  });
});
