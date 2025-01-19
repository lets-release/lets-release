import { $ } from "execa";

import { pushBranch } from "src/utils/git/pushBranch";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("pushBranch", () => {
  it("should push branch", async () => {
    await pushBranch(
      "https://github.com/lets-release/lets-release.git",
      "main",
    );

    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
