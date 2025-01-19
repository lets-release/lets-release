import { $ } from "execa";

import { pushTag } from "src/utils/git/pushTag";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("pushTag", () => {
  it("should push tag", async () => {
    await pushTag("https://github.com/lets-release/lets-release.git", "v1.0.0");

    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
