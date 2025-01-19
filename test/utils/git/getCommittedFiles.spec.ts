import { getCommittedFiles } from "src/utils/git/getCommittedFiles";
import { addFiles } from "test/__helpers__/git/addFiles";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";
import { writeFile } from "test/__helpers__/writeFile";

describe("getCommittedFiles", () => {
  it("should get committed files", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file1.js"]);
    await addFiles(cwd);
    const hash1 = await commit(cwd, "Add file file1.js");
    await writeFile(cwd, ["file2.js"]);
    await addFiles(cwd);
    const hash2 = await commit(cwd, "Add file file2.js");
    await writeFile(cwd, ["file3.js"]);
    await addFiles(cwd);
    const hash3 = await commit(cwd, "Add file file3.js");

    await expect(getCommittedFiles(hash1, { cwd })).resolves.toEqual([
      "file1.js",
    ]);
    await expect(getCommittedFiles(hash2, { cwd })).resolves.toEqual([
      "file2.js",
    ]);
    await expect(getCommittedFiles(hash3, { cwd })).resolves.toEqual([
      "file3.js",
    ]);
  });
});
