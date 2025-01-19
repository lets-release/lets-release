import { $ } from "execa";

import { UnsupportedGitVersionError } from "src/errors/UnsupportedGitVersionError";
import { verifyGitVersion } from "src/utils/verifyGitVersion";

vi.mock("execa");

describe("verifyGitVersion", () => {
  beforeEach(() => {
    vi.mocked($).mockReset();
  });

  it("should throw error if git binary not found", async () => {
    vi.mocked($).mockRejectedValue(new Error("Command not found"));

    await expect(verifyGitVersion()).rejects.toThrowError(AggregateError);
  });

  it("should throw error if git binary not found", async () => {
    vi.mocked($).mockResolvedValue({
      stdout: "git version 2.7.0",
    } as never);

    await expect(verifyGitVersion()).rejects.toThrowError(
      UnsupportedGitVersionError,
    );
  });
});
