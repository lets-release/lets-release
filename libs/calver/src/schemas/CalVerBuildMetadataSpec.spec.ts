import { buildWithVariable } from "src/__fixtures__/identifiers";
import { CalVerBuildMetadataSpec } from "src/schemas/CalVerBuildMetadataSpec";

describe("CalVerBuildMetadataSpec", () => {
  it("should return valid build metadata spec", async () => {
    // literal true
    await expect(CalVerBuildMetadataSpec.parseAsync(true)).resolves.toBe(true);

    // template string
    await expect(
      CalVerBuildMetadataSpec.parseAsync(buildWithVariable),
    ).resolves.toBe(buildWithVariable);

    // record of literal true or template string
    await expect(
      CalVerBuildMetadataSpec.parseAsync({
        npm: buildWithVariable,
        pypi: true,
      }),
    ).resolves.toEqual({
      npm: buildWithVariable,
      pypi: true,
    });
  });
});
