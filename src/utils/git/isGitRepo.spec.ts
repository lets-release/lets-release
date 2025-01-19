import { $ } from "execa";

import { isGitRepo } from "src/utils/git/isGitRepo";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("isGitRepo", () => {
  beforeEach(() => {
    exec.mockReset();
  });

  it("should return true if is git repo", async () => {
    exec.mockResolvedValue({});

    await expect(isGitRepo()).resolves.toBeTruthy();
    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });

  it("should return false if is not git repo", async () => {
    exec.mockRejectedValue(new Error("fatal: not a git repository"));

    await expect(isGitRepo()).resolves.toBeFalsy();
    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
