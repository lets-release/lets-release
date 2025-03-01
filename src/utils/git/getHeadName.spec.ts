import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getHeadName } from "src/utils/git/getHeadName";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getHeadName", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should get head name", async () => {
    const stdout = " \n test \n\n ";
    exec.mockResolvedValue({ stdout });

    await expect(getHeadName()).resolves.toBe("test");
    expect(vi.mocked($)).toHaveBeenCalledWith({ lines: false, reject: false });
    expect(exec).toHaveBeenCalledOnce();
  });
});
