import { buildWithVariable } from "src/__fixtures__/builds";
import { SemVerBuildMetadataSpec } from "src/schemas/SemVerBuildMetadataSpec";

describe("SemVerBuildMetadataSpec", () => {
  it("should validate semver build metadata spec", async () => {
    await expect(SemVerBuildMetadataSpec.parseAsync(true)).resolves.toBe(true);

    await expect(
      SemVerBuildMetadataSpec.parseAsync(buildWithVariable),
    ).resolves.toBe(buildWithVariable);

    await expect(
      SemVerBuildMetadataSpec.parseAsync({
        npm: buildWithVariable,
        pypi: true,
      }),
    ).resolves.toEqual({
      npm: buildWithVariable,
      pypi: true,
    });
  });
});
