import { $ } from "execa";

import { UnsupportedGitVersionError } from "src/errors/UnsupportedGitVersionError";
import { verifyGitVersion } from "src/utils/verifyGitVersion";

vi.mock("execa");

const fn = vi.fn();

vi.mocked($).mockReturnValue(fn as never);

describe("verifyGitVersion", () => {
  beforeEach(() => {
    fn.mockReset();
  });

  it("should throw error if git binary not found", async () => {
    fn.mockRejectedValue(new Error("Command not found"));

    await expect(verifyGitVersion()).rejects.toThrowError(AggregateError);
  });

  it("should throw error if git binary not found", async () => {
    fn.mockResolvedValue({
      stdout: "git version 2.7.0",
    } as never);

    await expect(verifyGitVersion()).rejects.toThrowError(
      UnsupportedGitVersionError,
    );
  });
});
