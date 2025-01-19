import { PublishContext } from "@lets-release/config";

import { InvalidStepResultError } from "src/errors/InvalidStepResultError";
import { validateArtifactInfo } from "src/utils/plugin/validators/validateArtifactInfo";

describe("validateArtifactInfo", () => {
  it("should return undefined for valid artifact info", async () => {
    await expect(
      validateArtifactInfo({} as PublishContext, "test", undefined),
    ).resolves.toBeUndefined();
    await expect(
      validateArtifactInfo({} as PublishContext, "test", { name: "test" }),
    ).resolves.toBeUndefined();
    await expect(
      validateArtifactInfo({} as PublishContext, "test", {
        name: "test",
        url: "test",
      }),
    ).resolves.toBeUndefined();
  });

  it("should throw InvalidStepResultError for invalid artifact info", async () => {
    await expect(
      validateArtifactInfo({} as PublishContext, "test", "test"),
    ).rejects.toThrow(InvalidStepResultError);
    await expect(
      validateArtifactInfo({} as PublishContext, "test", {}),
    ).rejects.toThrow(InvalidStepResultError);
    await expect(
      validateArtifactInfo({} as PublishContext, "test", { url: "test" }),
    ).rejects.toThrow(InvalidStepResultError);
  });
});
