import { buildWithVariable } from "src/__fixtures__/builds";
import { BuildMetadataSpec } from "src/schemas/BuildMetadataSpec";

describe("BuildMetadataSpec", () => {
  it("should validate build metadata spec", async () => {
    await expect(BuildMetadataSpec.parseAsync(true)).resolves.toBe(true);

    await expect(BuildMetadataSpec.parseAsync(buildWithVariable)).resolves.toBe(
      buildWithVariable,
    );

    await expect(
      BuildMetadataSpec.parseAsync({
        npm: buildWithVariable,
        pypi: true,
      }),
    ).resolves.toEqual({
      npm: buildWithVariable,
      pypi: true,
    });
  });
});
