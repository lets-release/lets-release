import { $ } from "execa";

import { getRemoteUrl } from "src/utils/git/getRemoteUrl";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("getRemoteUrl", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should get remote url", async () => {
    const stdout = " \n test \n\n ";
    exec.mockResolvedValue({ stdout });

    await expect(getRemoteUrl("origin")).resolves.toBe("test");
    expect(vi.mocked($)).toHaveBeenCalledWith({ lines: false });
    expect(exec).toHaveBeenCalledOnce();
  });

  it("should return undefined if remote url is not found", async () => {
    await expect(getRemoteUrl("origin")).resolves.toBeUndefined();
    expect(vi.mocked($)).toHaveBeenCalledWith({ lines: false });
    expect(exec).toHaveBeenCalledOnce();
  });
});
