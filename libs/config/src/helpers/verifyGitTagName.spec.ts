import { verifyGitTagName } from "src/helpers/verifyGitTagName";

describe("verifyGitTagName", () => {
  it("should return true for valid tag name", async () => {
    await expect(verifyGitTagName("v1.2.3")).resolves.toBe(true);
  });

  it("should return false for invalid tag name", async () => {
    await expect(verifyGitTagName("v 1.2.3")).resolves.toBe(false);
  });
});
