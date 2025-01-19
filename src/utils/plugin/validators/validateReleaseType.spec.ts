import { AnalyzeCommitsContext, ReleaseType } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { validateReleaseType } from "src/utils/plugin/validators/validateReleaseType";

describe("validateReleaseType", () => {
  it("should validate release type", async () => {
    await expect(
      validateReleaseType({} as AnalyzeCommitsContext, "test", undefined),
    ).resolves.toBeUndefined();
    await expect(
      validateReleaseType(
        {} as AnalyzeCommitsContext,
        "test",
        ReleaseType.major,
      ),
    ).resolves.toBeUndefined();
    await expect(
      validateReleaseType({} as AnalyzeCommitsContext, "test", "test"),
    ).rejects.toThrow(InvalidStepResultError);
  });
});
