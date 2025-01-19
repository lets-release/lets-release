import { $ } from "execa";

import { addFiles } from "src/utils/git/addFiles";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("addFiles", () => {
  it("should add files", async () => {
    await addFiles(["README.md"]);

    expect(vi.mocked($)).toHaveBeenCalledWith({ reject: false });
    expect(exec).toHaveBeenCalledOnce();
  });
});
