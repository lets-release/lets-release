import { ZodError } from "zod";

import { buildWithVariable, builds } from "src/__fixtures__/builds";
import { BuildMetadata } from "src/schemas/BuildMetadata";

describe("BuildMetadata", () => {
  const validBuilds = builds.filter((b) => b.isValid);
  const invalidBuilds = builds.filter((b) => !b.isValid);

  it("should return valid build metadata with variable", async () => {
    await expect(BuildMetadata.parseAsync(buildWithVariable)).resolves.toBe(
      buildWithVariable,
    );
  });

  it.each(validBuilds)(
    "should return valid build metadata: $value",
    async ({ value }) => {
      await expect(BuildMetadata.parseAsync(value), value).resolves.toBe(value);
    },
  );

  it.each(invalidBuilds)(
    "should throw for invalid build metadata: $value",
    async ({ value }) => {
      await expect(BuildMetadata.parseAsync(value), value).rejects.toThrow(
        ZodError,
      );
    },
  );
});
