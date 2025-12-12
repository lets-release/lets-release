import { builds } from "src/__fixtures__/builds";
import { isValidBuildMetadata } from "src/helpers/isValidBuildMetadata";

describe("isValidBuildMetadata", () => {
  it.each(builds)(
    "should validate build metadata: $value",
    ({ value, isValid }) => {
      expect(isValidBuildMetadata(value), value).toBe(isValid ?? false);
    },
  );
});
