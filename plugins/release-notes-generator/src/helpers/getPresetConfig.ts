import { ConventionalChangelogPreset } from "@lets-release/conventional-changelog";

import { ReleaseNotesGeneratorOptions } from "src/schemas/ReleaseNotesGeneratorOptions";

export function getPresetConfig(
  options: ReleaseNotesGeneratorOptions,
  hostConfig: {
    issue: string;
    commit: string;
  },
): ReleaseNotesGeneratorOptions["presetConfig"] {
  if (
    !options.preset ||
    options.preset === ConventionalChangelogPreset.ConventionalCommits
  ) {
    const issue = options.issue ?? hostConfig.issue;
    const commit = options.commit ?? hostConfig.commit;

    return {
      issueUrlFormat: `{{host}}/{{owner}}/{{repository}}/${issue}/{{id}}`,
      commitUrlFormat: `{{host}}/{{owner}}/{{repository}}/${commit}/{{hash}}`,
      ...options.presetConfig,
    };
  }

  return options.presetConfig;
}
