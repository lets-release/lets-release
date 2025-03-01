import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getNote } from "src/utils/git/getNote";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getNote", () => {
  beforeEach(() => {
    vi.mocked($).mockClear();
    exec.mockReset();
  });

  it("should return merged notes", async () => {
    exec.mockRejectedValue({
      exitCode: 1,
    });

    await expect(getNote("ref")).resolves.toEqual({});
  });

  it("should throw error if failed to get notes", async () => {
    exec.mockRejectedValue({
      exitCode: 2,
    });

    await expect(getNote("ref")).rejects.toThrow();
  });
});
