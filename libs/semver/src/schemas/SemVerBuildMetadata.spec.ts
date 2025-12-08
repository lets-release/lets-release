import { ZodError } from "zod";

import { buildWithVariable, builds } from "src/__fixtures__/builds";
import { SemVerBuildMetadata } from "src/schemas/SemVerBuildMetadata";

describe("SemVerBuildMetadata", () => {
  const validBuilds = builds.filter((b) => b.isValid);
  const invalidBuilds = builds.filter((b) => !b.isValid);

  it("should return valida semver build metadata with variable", async () => {
    await expect(
      SemVerBuildMetadata.parseAsync(buildWithVariable),
    ).resolves.toBe(buildWithVariable);
  });

  it.each(validBuilds)(
    "should return valid build metadata: $value",
    async ({ value }) => {
      await expect(SemVerBuildMetadata.parseAsync(value), value).resolves.toBe(
        value,
      );
    },
  );

  it.each(invalidBuilds)(
    "should throw for invalid build metadata: $value",
    async ({ value }) => {
      await expect(
        SemVerBuildMetadata.parseAsync(value),
        value,
      ).rejects.toThrow(ZodError);
    },
  );
});
