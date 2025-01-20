import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import fsExtra from "fs-extra";

import { Step, StepFunction } from "@lets-release/config";

import { ChangelogOptions } from "src/schemas/ChangelogOptions";

// eslint-disable-next-line import-x/no-named-as-default-member
const { ensureFile } = fsExtra;

export const prepare: StepFunction<Step.prepare, ChangelogOptions> = async (
  { logger, package: pkg, nextRelease: { notes } },
  options,
) => {
  const { changelogFile, changelogTitle } =
    await ChangelogOptions.parseAsync(options);
  const changelogPath = path.resolve(pkg.path, changelogFile);

  if (notes) {
    await ensureFile(changelogPath);
    const currentFileBuffer = await readFile(changelogPath);
    const currentFile = currentFileBuffer.toString().trim();

    if (currentFile) {
      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Update ${changelogPath}`,
      });
    } else {
      logger.log({
        prefix: `[${pkg.name}]`,
        message: `Create ${changelogPath}`,
      });
    }

    const currentContent =
      changelogTitle && currentFile.startsWith(changelogTitle)
        ? currentFile.slice(changelogTitle.length).trim()
        : currentFile;
    const content = `${notes.trim()}\n${currentContent ? `\n${currentContent}\n` : ""}`;

    await writeFile(
      changelogPath,
      changelogTitle ? `${changelogTitle}\n\n${content}` : content,
    );
  }
};
