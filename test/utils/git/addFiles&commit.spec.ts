import { writeFile } from "node:fs/promises";
import path from "node:path";

import {
  VerifyConditionsContext,
  VersioningScheme,
} from "@lets-release/config";
import { SemVerOptions } from "@lets-release/semver";

import { getCommits } from "src/utils/branch/getCommits";
import { addFiles } from "src/utils/git/addFiles";
import { commit } from "src/utils/git/commit";
import { getStagedFiles } from "test/__helpers__/git/getStagedFiles";
import { initRepo } from "test/__helpers__/git/initRepo";

describe("addFiles & commit", () => {
  it("should add files to index and commit", async () => {
    const cwd = await initRepo();

    await writeFile(path.resolve(cwd, "file1.js"), "");
    await writeFile(path.resolve(cwd, "file2.js"), "");

    await addFiles(["."], { cwd });

    await expect(getStagedFiles(cwd)).resolves.toEqual([
      "file1.js",
      "file2.js",
    ]);

    await commit("Test commit", { cwd });

    const packages = [
      {
        main: true,
        path: cwd,
        type: "npm",
        name: "main",
        uniqueName: "main",
        pluginName: "npm",
        versioning: await SemVerOptions.parseAsync({
          scheme: VersioningScheme.SemVer,
        }),
      },
    ];

    const commits = await getCommits(
      { repositoryRoot: cwd, options: {}, packages } as VerifyConditionsContext,
      packages,
    );

    expect(commits.main).toHaveLength(1);
  });
});
