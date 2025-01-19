import { $ } from "execa";

import { commit } from "src/utils/git/commit";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("commit", () => {
  it("should commit", async () => {
    await commit("123");

    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
