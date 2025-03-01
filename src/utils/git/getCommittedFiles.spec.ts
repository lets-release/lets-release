import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getCommittedFiles } from "src/utils/git/getCommittedFiles";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getCommittedFiles", () => {
  it("should get branch tags", async () => {
    exec.mockResolvedValue({
      stdout: ["src/a.ts", ' "src/b.ts" ', " ", " src/c.ts"],
    });

    await expect(getCommittedFiles("commit")).resolves.toEqual([
      "src/a.ts",
      "src/b.ts",
      "src/c.ts",
    ]);

    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: true,
    });
    expect(exec).toHaveBeenCalledOnce();
  });
});
