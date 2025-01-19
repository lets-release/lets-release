import { TagNote } from "src/types/TagNote";
import { addNote } from "src/utils/git/addNote";
import { getNote } from "src/utils/git/getNote";
import { addTag } from "test/__helpers__/git/addTag";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";

const ref = "v1.0.0";
const note: TagNote = {
  artifacts: [
    {
      name: "npm package",
      channels: [null],
      pluginName: "npm",
    },
  ],
};

describe("addNote & getNote", () => {
  it("should add and get a note", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await commit(cwd, "Initial commit");
    await addTag(cwd, ref);
    await addNote(ref, note, { cwd });

    await expect(getNote(ref, { cwd })).resolves.toEqual(note);
  });
});
