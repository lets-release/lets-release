import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { NoGitBinaryError } from "src/errors/NoGitBinaryError";
import { UnsupportedGitVersionError } from "src/errors/UnsupportedGitVersionError";
import { verifyGitVersion } from "src/utils/verifyGitVersion";

vi.mock("execa");
vi.mock("strip-ansi");

const fn = vi.fn();

vi.mocked($).mockReturnValue(fn as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("verifyGitVersion", () => {
  beforeEach(() => {
    fn.mockReset();
  });

  it("should throw error if git binary not found", async () => {
    fn.mockRejectedValue(new Error("Command not found"));

    await expect(verifyGitVersion()).rejects.toThrowError(NoGitBinaryError);
  });

  it("should throw error if git version is too old", async () => {
    fn.mockResolvedValue({
      stdout: "git version 2.7.0",
    } as never);

    await expect(verifyGitVersion()).rejects.toThrowError(
      UnsupportedGitVersionError,
    );
  });

  it("should not throw error if git version meets minimum requirement", async () => {
    fn.mockResolvedValue({
      stdout: "git version 2.7.1",
    } as never);

    await expect(verifyGitVersion()).resolves.toBeUndefined();
  });

  it("should not throw error if git version is newer than minimum requirement", async () => {
    fn.mockResolvedValue({
      stdout: "git version 2.30.0",
    } as never);

    await expect(verifyGitVersion()).resolves.toBeUndefined();
  });
});
