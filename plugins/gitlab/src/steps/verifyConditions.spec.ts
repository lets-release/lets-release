import { VerifyConditionsContext } from "@lets-release/config";

import { ensureGitLabContext } from "src/helpers/ensureGitLabContext";
import { verifyConditions } from "src/steps/verifyConditions";

vi.mock("src/helpers/ensureGitLabContext");

describe("verifyConditions", () => {
  const context = {} as VerifyConditionsContext;
  const options = {};

  it("should call ensureGitLabContext with correct arguments", async () => {
    await verifyConditions(context, options);
    expect(ensureGitLabContext).toHaveBeenCalledWith(context, options);
  });

  it("should throw an error if ensureGitLabContext throws an error", async () => {
    vi.mocked(ensureGitLabContext).mockImplementationOnce(() => {
      throw new Error("Test error");
    });

    await expect(verifyConditions(context, options)).rejects.toThrow(
      "Test error",
    );
  });
});
