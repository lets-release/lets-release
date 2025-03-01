import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getTagHash } from "src/utils/git/getTagHash";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getTagHash", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should get tag has", async () => {
    const stdout = " \n test \n\n ";
    exec.mockResolvedValue({ stdout });

    await expect(getTagHash("v1.0.0")).resolves.toBe("test");
    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: false,
    });
    expect(exec).toHaveBeenCalledOnce();
  });
});
