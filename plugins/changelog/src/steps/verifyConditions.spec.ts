import { ZodError } from "zod";

import { VerifyConditionsContext } from "@lets-release/config";

import { verifyConditions } from "src/steps/verifyConditions";

describe("verifyConditions", () => {
  it("should validate options", async () => {
    await expect(
      verifyConditions({} as VerifyConditionsContext, {}),
    ).resolves.toBeUndefined();
  });

  it("should throw error for invalid options", async () => {
    await expect(
      verifyConditions(
        {} as VerifyConditionsContext,
        {
          changelogFile: 1234,
        } as never,
      ),
    ).rejects.toThrow(ZodError);
  });
});
