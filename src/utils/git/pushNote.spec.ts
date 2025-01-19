import { $ } from "execa";

import { pushNote } from "src/utils/git/pushNote";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("pushNote", () => {
  it("should push note", async () => {
    await pushNote(
      "https://github.com/lets-release/lets-release.git",
      "v1.0.0",
    );

    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
