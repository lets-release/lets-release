import { mkdir } from "node:fs/promises";
import path from "node:path";

import { getRoot } from "src/utils/git/getRoot";
import { initRepo } from "test/__helpers__/git/initRepo";

describe("getRoot", () => {
  it("should get the root of the git repository", async () => {
    const cwd = await initRepo();
    const dir = path.resolve(cwd, "dir");

    await mkdir(dir);

    await expect(getRoot({ cwd: dir })).resolves.toBe(cwd);
  });
});
