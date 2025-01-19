import { $ } from "execa";

import { addNote } from "src/utils/git/addNote";

vi.mock("execa");

const exec = vi.fn();

vi.mocked($).mockReturnValue(exec as never);

describe("addNote", () => {
  it("should add note", async () => {
    await addNote("v1.0.0", {
      artifacts: [
        { name: "npm package", pluginName: "npm", channels: ["latest"] },
      ],
    });

    expect(vi.mocked($)).toHaveBeenCalledWith({});
    expect(exec).toHaveBeenCalledOnce();
  });
});
