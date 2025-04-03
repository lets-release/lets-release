import { verifyGitBranchName } from "src/helpers/verifyGitBranchName";

describe("verifyGitBranchName", () => {
  it("should return true for valid branch name", async () => {
    await expect(verifyGitBranchName("main")).resolves.toBe(true);
  });

  it("should return false for invalid branch name", async () => {
    await expect(verifyGitBranchName("main x")).resolves.toBe(false);
  });
});
