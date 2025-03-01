import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getRoot } from "src/utils/git/getRoot";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getRoot", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should get repo root", async () => {
    const stdout = " \n test \n\n ";
    exec.mockResolvedValue({ stdout });

    await expect(getRoot()).resolves.toBe("test");
    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: false,
    });
    expect(exec).toHaveBeenCalledOnce();
  });

  it("should throw error if not git repo", async () => {
    const error = new Error("test");
    exec.mockRejectedValue(error);

    await expect(getRoot()).rejects.toThrow(error);
    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: false,
    });
    expect(exec).toHaveBeenCalledOnce();
  });
});
