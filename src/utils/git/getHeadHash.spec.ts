import { $ } from "execa";

import { getHeadHash } from "src/utils/git/getHeadHash";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("getHeadHash", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should get tag has", async () => {
    const stdout = " \n test \n\n ";
    exec.mockResolvedValue({ stdout });

    await expect(getHeadHash()).resolves.toBe("test");
    expect(vi.mocked($)).toHaveBeenCalledWith({ lines: false });
    expect(exec).toHaveBeenCalledOnce();
  });
});
