import { VerifyConditionsContext } from "@lets-release/config";

import { ensureGitHubContext } from "src/helpers/ensureGitHubContext";
import { verifyConditions } from "src/steps/verifyConditions";

vi.mock("src/helpers/ensureGitHubContext");

describe("verifyConditions", () => {
  it("should verify conditions", async () => {
    await expect(
      verifyConditions({} as unknown as VerifyConditionsContext, {}),
    ).resolves.toBeUndefined();

    expect(ensureGitHubContext).toHaveBeenCalledTimes(1);
  });
});
