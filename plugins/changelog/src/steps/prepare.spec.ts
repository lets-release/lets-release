import { readFile } from "node:fs/promises";
import path from "node:path";

import { ensureFile, writeFile } from "fs-extra";

import { PrepareContext } from "@lets-release/config";

import { prepare } from "src/steps/prepare";

vi.mock("node:fs/promises");
vi.mock("fs-extra", () => {
  return {
    ensureFile: vi.fn(),
    readFile,
    writeFile: vi.fn(),
  };
});

const logger = { log: vi.fn() };
const repositoryRoot = path.resolve("/path/to/workspace");
const nextRelease = { notes: "some notes" };
const options = { changelogFile: "CHANGELOG.md" };

describe("prepare", () => {
  beforeEach(() => {
    vi.mocked(readFile).mockReset();
    vi.mocked(ensureFile).mockClear();
    vi.mocked(writeFile).mockClear();
  });

  it("should create changelog", async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from(""));

    await prepare(
      {
        logger,
        package: { path: repositoryRoot },
        nextRelease,
      } as unknown as PrepareContext,
      options,
    );

    expect(ensureFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
    );
    expect(readFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
    );
    expect(writeFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
      "some notes\n",
    );
  });

  it("should update changelog", async () => {
    vi.mocked(readFile).mockResolvedValue(Buffer.from("some content"));

    await prepare(
      {
        logger,
        package: { path: repositoryRoot },
        nextRelease,
      } as unknown as PrepareContext,
      options,
    );

    expect(ensureFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
    );
    expect(readFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
    );
    expect(writeFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
      "some notes\n\nsome content\n",
    );
  });

  it("should update changelog with title", async () => {
    const changelogTitle = "# Changelog";

    vi.mocked(readFile).mockResolvedValue(
      Buffer.from(`${changelogTitle}\nsome content`),
    );

    await prepare(
      {
        logger,
        package: { path: repositoryRoot },
        nextRelease,
      } as unknown as PrepareContext,
      {
        ...options,
        changelogTitle,
      },
    );

    expect(ensureFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
    );
    expect(readFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
    );
    expect(writeFile).toHaveBeenCalledWith(
      path.resolve(repositoryRoot, "CHANGELOG.md"),
      `${changelogTitle}\n\nsome notes\n\nsome content\n`,
    );
  });
});
