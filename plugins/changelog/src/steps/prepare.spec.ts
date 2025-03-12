import { existsSync } from "node:fs";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { PrepareContext } from "@lets-release/config";

import { prepare } from "src/steps/prepare";

vi.mock("node:fs/promises");

const logger = { log: vi.fn() };
const repositoryRoot = path.resolve("/path/to/workspace");
const nextRelease = { notes: "some notes" };
const options = { changelogFile: "CHANGELOG.md" };

describe("prepare", () => {
  beforeEach(() => {
    vi.mocked(existsSync).mockReset();
    vi.mocked(readFile).mockReset();
    vi.mocked(writeFile).mockClear();
  });

  it("should create changelog", async () => {
    vi.mocked(existsSync).mockReturnValue(false);

    await prepare(
      {
        logger,
        package: {
          path: repositoryRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease,
      } as unknown as PrepareContext,
      options,
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
        package: {
          path: repositoryRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease,
      } as unknown as PrepareContext,
      options,
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
        package: {
          path: repositoryRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease,
      } as unknown as PrepareContext,
      {
        ...options,
        changelogTitle,
      },
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
