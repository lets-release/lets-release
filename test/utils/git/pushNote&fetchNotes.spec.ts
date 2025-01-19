import { TagNote } from "src/types/TagNote";
import { fetchNotes } from "src/utils/git/fetchNotes";
import { getNote } from "src/utils/git/getNote";
import { pushNote } from "src/utils/git/pushNote";
import { addFiles } from "test/__helpers__/git/addFiles";
import { addNote } from "test/__helpers__/git/addNote";
import { addTag } from "test/__helpers__/git/addTag";
import { checkoutBranch } from "test/__helpers__/git/checkoutBranch";
import { cloneRepo } from "test/__helpers__/git/cloneRepo";
import { commit } from "test/__helpers__/git/commit";
import { initRepoAndCheckoutRemoteHead } from "test/__helpers__/git/initRepoAndCheckoutRemoteHead";
import { initRepoAsRemote } from "test/__helpers__/git/initRepoAsRemote";
import { pushBranch } from "test/__helpers__/git/pushBranch";
import { writeFile } from "test/__helpers__/writeFile";

const tag = "v1.0.0";
const artifacts = [
  {
    name: "npm package",
    channels: [null],
    pluginName: "npm",
  },
];
const note: TagNote = {
  artifacts,
};

describe("pushNote & fetchNotes", () => {
  it("should push note and fetch notes", async () => {
    const url = await initRepoAsRemote();
    const cwd = await cloneRepo(url);

    await checkoutBranch(cwd, "main");
    await writeFile(cwd, ["file"]);
    await addFiles(cwd);
    const hash = await commit(cwd, "first commit");
    await writeFile(cwd, ["file2"]);
    await addFiles(cwd);
    await commit(cwd, "second commit");
    await addTag(cwd, tag);
    await writeFile(cwd, ["file3"]);
    await addFiles(cwd);
    await commit(cwd, "third commit");
    await pushBranch(cwd, url, "main");
    await addNote(cwd, tag, artifacts);
    await pushNote(url, tag, { cwd });

    const shallowRepoRoot = await cloneRepo(url, "main", 1);
    await fetchNotes(url, { cwd: shallowRepoRoot });
    await expect(getNote(tag, { cwd: shallowRepoRoot })).resolves.toEqual(note);

    const detachedRepoRoot = await initRepoAndCheckoutRemoteHead(url, hash);
    await fetchNotes(url, { cwd: detachedRepoRoot });
    await expect(getNote(tag, { cwd: shallowRepoRoot })).resolves.toEqual(note);

    const repositoryRoot = await cloneRepo(url, "main");
    await fetchNotes(url, { cwd: repositoryRoot });
    await expect(getNote(tag, { cwd: repositoryRoot })).resolves.toEqual(note);
  });
});
