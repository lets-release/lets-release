import { $ } from "execa";

import { getCommittedFiles } from "src/utils/git/getCommittedFiles";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

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
