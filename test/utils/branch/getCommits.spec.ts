import path from "node:path";

import { CalVerOptions } from "@lets-release/calver";
import {
  VerifyConditionsContext,
  VersioningScheme,
} from "@lets-release/config";
import { SemVerOptions } from "@lets-release/semver";

import { getCommits } from "src/utils/branch/getCommits";
import { addFiles } from "test/__helpers__/git/addFiles";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { commit } from "test/__helpers__/git/commit";
import { initRepo } from "test/__helpers__/git/initRepo";
import { writeFile } from "test/__helpers__/writeFile";

describe("getCommits", () => {
  it("should get all commits", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file"]);
    await addFiles(cwd);
    await commit(cwd, "Add file file");
    await writeFile(cwd, ["a", "file"]);
    await addFiles(cwd);
    await commit(cwd, "Add file a/file");
    await writeFile(cwd, ["b", "file"]);
    await addFiles(cwd);
    await commit(cwd, "Add file b/file");

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
      {
        path: path.resolve(cwd, "a"),
        type: "npm",
        name: "a",
        uniqueName: "a",
        pluginName: "npm",
        versioning: await SemVerOptions.parseAsync({
          scheme: VersioningScheme.SemVer,
        }),
      },
      {
        path: path.resolve(cwd, "b"),
        type: "npm",
        name: "b",
        uniqueName: "b",
        pluginName: "npm",
        versioning: await CalVerOptions.parseAsync({
          scheme: VersioningScheme.CalVer,
          format: "YY.MINOR.MICRO",
        }),
      },
    ];

    await expect(
      getCommits(
        {
          repositoryRoot: cwd,
          options: {},
          packages,
        } as VerifyConditionsContext,
        packages,
      ),
    ).resolves.toEqual({
      main: [
        expect.objectContaining({
          message: "Add file file",
        }),
      ],
      a: [
        expect.objectContaining({
          message: "Add file a/file",
        }),
      ],
      b: [
        expect.objectContaining({
          message: "Add file b/file",
        }),
      ],
    });
  });

  it("should get commits after specified commit", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file1"]);
    await addFiles(cwd);
    await commit(cwd, "Add file file1");
    await writeFile(cwd, ["file2"]);
    await addFiles(cwd);
    const hash = await commit(cwd, "Add file file2");
    await writeFile(cwd, ["file3"]);
    await addFiles(cwd);
    await commit(cwd, "Add file file3");

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

    await expect(
      getCommits(
        {
          repositoryRoot: cwd,
          options: {},
          packages,
        } as VerifyConditionsContext,
        packages,
        hash,
      ),
    ).resolves.toEqual({
      main: [
        expect.objectContaining({
          message: "Add file file3",
        }),
      ],
    });
  });

  it("should get commits between specified commits", async () => {
    const cwd = await initRepo();

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file1"]);
    await addFiles(cwd);
    const from = await commit(cwd, "Add file file1");
    await writeFile(cwd, ["file2"]);
    await addFiles(cwd);
    const to = await commit(cwd, "Add file file2");
    await writeFile(cwd, ["file3"]);
    await addFiles(cwd);
    await commit(cwd, "Add file file3");

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

    await expect(
      getCommits(
        {
          repositoryRoot: cwd,
          options: {},
          packages,
        } as VerifyConditionsContext,
        packages,
        from,
        to,
      ),
    ).resolves.toEqual({
      main: [
        expect.objectContaining({
          message: "Add file file2",
        }),
      ],
    });
  });
});
