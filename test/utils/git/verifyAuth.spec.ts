import { randomInt } from "node:crypto";

import { verifyAuth } from "src/utils/git/verifyAuth";
import { addFiles } from "test/__helpers__/git/addFiles";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { createAndCloneRepo } from "test/__helpers__/git/createAndCloneRepo";
import { writeFile } from "test/__helpers__/writeFile";

describe("verifyAuth", () => {
  it("should throw an error if not authorized to push", async () => {
    const url = "https://user:password@github.com/github/gitignore";
    const cwd = await cloneRepo(url, "main", 1);

    await writeFile(cwd, ["test.txt"]);
    await addFiles(cwd);
    await commit(cwd, "Initial commit");

    await expect(verifyAuth(url, "main", { cwd })).rejects.toThrow();
  });

  it("should not throw an error if authorized to push", async () => {
    const { cwd, authUrl } = await createAndCloneRepo(
      `test-verify-auth-pass-${randomInt(0, 1000)}`,
    );

    await writeFile(cwd, ["test.txt"]);
    await addFiles(cwd);
    await commit(cwd, "Initial commit");

    await expect(verifyAuth(authUrl, "main", { cwd })).resolves.toBeUndefined();
  });
});
