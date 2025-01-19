import { $ } from "execa";

import { addTag } from "src/utils/git/addTag";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("addTag", () => {
  it("should add tag", async () => {
    await addTag("123", "v1.0.0");

    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
