import { $ } from "execa";

import { getModifiedFiles } from "src/utils/git/getModifiedFiles";

vi.mock("execa");

const stdout = [" ", "file1", "file2", "", " file3 ", "", " "];
const exec = vi.fn().mockResolvedValue({ stdout });

vi.mocked($).mockReturnValue(exec as never);

describe("getModifiedFiles", () => {
  it("should get modified files", async () => {
    await expect(getModifiedFiles()).resolves.toEqual([
      "file1",
      "file2",
      "file3",
    ]);
    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: true,
    });
    expect(exec).toHaveBeenCalledOnce();
  });
});
