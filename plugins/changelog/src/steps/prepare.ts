import { existsSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

import { Step, StepFunction } from "@lets-release/config";

import { ChangelogOptions } from "src/schemas/ChangelogOptions";

export const prepare: StepFunction<Step.prepare, ChangelogOptions> = async (
  { logger, package: pkg, nextRelease: { notes } },
  options,
) => {
  const { changelogFile, changelogTitle } =
    await ChangelogOptions.parseAsync(options);
  const changelogPath = path.resolve(pkg.path, changelogFile);

  if (notes) {
    await mkdir(path.dirname(changelogPath), { recursive: true });
    const currentFileBuffer = existsSync(changelogPath)
      ? await readFile(changelogPath)
      : undefined;
    const currentFile = currentFileBuffer?.toString().trim() ?? "";

    if (currentFile) {
      logger.log({
        prefix: `[${pkg.uniqueName}]`,
        message: `Update ${changelogPath}`,
      });
    } else {
      logger.log({
        prefix: `[${pkg.uniqueName}]`,
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
