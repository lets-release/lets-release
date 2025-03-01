import { $ } from "execa";
import stripAnsi from "strip-ansi";

import { getBranchTags } from "src/utils/git/getBranchTags";

vi.mock("execa");
vi.mock("strip-ansi");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);
vi.mocked(stripAnsi).mockImplementation((value) => value);

describe("getBranchTags", () => {
  it("should get branch tags", async () => {
    exec.mockResolvedValue({ stdout: ["v1.0.0", " v1.2.3 ", " ", " v3.4.5"] });

    await expect(getBranchTags("branch")).resolves.toEqual([
      "v1.0.0",
      "v1.2.3",
      "v3.4.5",
    ]);

    expect(vi.mocked($)).toHaveBeenCalledWith({
      lines: true,
    });
    expect(exec).toHaveBeenCalledOnce();
  });
});
