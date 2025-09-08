import { getModifiedFiles } from "src/utils/git/getModifiedFiles";
import { addFiles } from "test/__helpers__/git/addFiles";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";
import { writeFile } from "test/__helpers__/writeFile";

describe("getModifiedFiles", () => {
  it("should get the modified files, including files in .gitignore but including untracked ones", async () => {
    const cwd = await initRepo();

    // Create files
    await writeFile(cwd, ["file1.js"]);
    await writeFile(cwd, ["dir", "file2.js"]);
    await writeFile(cwd, ["file3.js"]);

    // Create .gitignore to ignore file3.js
    await writeFile(cwd, [".gitignore"], "file3.js");

    // Add files and commit
    await addFiles(cwd);
    await commit(cwd, "Initial commit");

    // Update file1.js, dir/file2.js and file3.js
    await writeFile(cwd, ["file1.js"], "Test content");
    await writeFile(cwd, ["dir", "file2.js"], "Test content");
    await writeFile(cwd, ["file3.js"], "Test content");

    // Add untracked file
    await writeFile(cwd, ["file4.js"], "Test content");

    const files = await getModifiedFiles({ cwd });

    expect(files.toSorted()).toEqual(
      ["file1.js", "dir/file2.js", "file3.js", "file4.js"].toSorted(),
    );
  });

  test("should returns empty array if there is no modified files", async () => {
    const cwd = await initRepo();

    await expect(getModifiedFiles({ cwd })).resolves.toHaveLength(0);
  });
});
