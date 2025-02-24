import path from "node:path";

import { CalVerOptions } from "@lets-release/calver";
import { BaseContext, VersioningScheme } from "@lets-release/config";
import { SemVerOptions } from "@lets-release/semver";

import { getCommits } from "src/utils/branch/getCommits";
import { pushBranch } from "src/utils/git/pushBranch";
import { addFiles } from "test/__helpers__/git/addFiles";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { writeFile } from "test/__helpers__/writeFile";

describe("pushBranch", () => {
  it("should push commits to remote branch", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file"]);
    await addFiles(cwd);
    await commit(cwd, "first commit");
    await writeFile(cwd, ["a", "file"]);
    await addFiles(cwd);
    await commit(cwd, "second commit");
    await writeFile(cwd, ["b", "file"]);
    await addFiles(cwd);
    await commit(cwd, "third commit");

    await pushBranch(url, "main", { cwd });

    const repositoryRoot = await cloneRepo(url, "main");

    await expect(
      getCommits(
        {
          repositoryRoot,
          options: {},
        } as BaseContext,
        [
          {
            main: true,
            path: repositoryRoot,
            type: "npm",
            name: "main",
            uniqueName: "main",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
          {
            path: path.resolve(repositoryRoot, "a"),
            type: "npm",
            name: "a",
            uniqueName: "a",
            pluginName: "npm",
            versioning: await SemVerOptions.parseAsync({
              scheme: VersioningScheme.SemVer,
            }),
          },
          {
            path: path.resolve(repositoryRoot, "b"),
            type: "npm",
            name: "b",
            uniqueName: "b",
            pluginName: "npm",
            versioning: await CalVerOptions.parseAsync({
              scheme: VersioningScheme.CalVer,
              format: "YY.MINOR.MICRO",
            }),
          },
        ],
      ),
    ).resolves.toEqual({
      main: [
        expect.objectContaining({
          message: "first commit",
        }),
      ],
      a: [
        expect.objectContaining({
          message: "second commit",
        }),
      ],
      b: [
        expect.objectContaining({
          message: "third commit",
        }),
      ],
    });
  });
});
