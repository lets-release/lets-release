import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { temporaryDirectory } from "tempy";

import { PrepareContext } from "@lets-release/config";

import { prepare } from "src/steps/prepare";

const logger = { log: vi.fn() };

describe("prepare", () => {
  it("should create changelog", async () => {
    const pkgRoot = temporaryDirectory();
    const notes = "Test release note";
    const changelogFile = "docs/changelog.txt";
    const changelogPath = path.resolve(pkgRoot, changelogFile);

    await prepare(
      {
        logger,
        package: {
          path: pkgRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease: { notes },
      } as unknown as PrepareContext,
      { changelogFile },
    );

    const buffer = await readFile(changelogPath);

    expect(buffer.toString()).toBe(`${notes}\n`);
  });

  it("should skip update changelog if release notes is empty", async () => {
    const pkgRoot = temporaryDirectory();
    const changelogFile = "CHANGELOG.txt";
    const changelogPath = path.resolve(pkgRoot, changelogFile);
    const notes = "Initial CHANGELOG";
    await writeFile(changelogPath, notes);

    await prepare(
      {
        logger,
        package: {
          path: pkgRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease: {},
      } as unknown as PrepareContext,
      { changelogFile },
    );

    const buffer = await readFile(changelogPath);

    expect(buffer.toString()).toBe(notes);
  });

  it("should update changelog", async () => {
    const pkgRoot = temporaryDirectory();
    const changelogFile = "CHANGELOG.md";
    const changelogPath = path.resolve(pkgRoot, changelogFile);
    const notes = "Initial CHANGELOG";
    const newNotes = "New release note";
    await writeFile(changelogPath, notes);

    await prepare(
      {
        logger,
        package: {
          path: pkgRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease: { notes: newNotes },
      } as unknown as PrepareContext,
      { changelogFile },
    );

    const buffer = await readFile(changelogPath);

    expect(buffer.toString()).toBe(`${newNotes}\n\n${notes}\n`);
  });

  it("should update changelog with title", async () => {
    const pkgRoot = temporaryDirectory();
    const changelogTitle = "# Changelog";
    const changelogFile = "CHANGELOG.md";
    const changelogPath = path.resolve(pkgRoot, changelogFile);
    const notes = "Initial CHANGELOG";
    const newNotes = "New release note";
    await writeFile(changelogPath, `${changelogTitle}\n\n${notes}\n`);

    await prepare(
      {
        logger,
        package: {
          path: pkgRoot,
          uniqueName: "npm/pkg",
        },
        nextRelease: { notes: newNotes },
      } as unknown as PrepareContext,
      { changelogTitle, changelogFile },
    );

    const buffer = await readFile(changelogPath);

    expect(buffer.toString()).toBe(
      `${changelogTitle}\n\n${newNotes}\n\n${notes}\n`,
    );
  });
});
