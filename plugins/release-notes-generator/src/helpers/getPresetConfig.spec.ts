import { ConventionalChangelogPreset } from "@lets-release/conventional-changelog";

import { getPresetConfig } from "src/helpers/getPresetConfig";

const issue = "test-issues";
const commit = "test-commits";
const presetConfig = {
  test: "test",
};

describe("getPresetConfig", () => {
  it("should set default url formats if options.preset is nil", () => {
    expect(getPresetConfig({ presetConfig }, { issue, commit })).toEqual({
      issueUrlFormat: `{{host}}/{{owner}}/{{repository}}/${issue}/{{id}}`,
      commitUrlFormat: `{{host}}/{{owner}}/{{repository}}/${commit}/{{hash}}`,
      ...presetConfig,
    });
  });

  it("should set default url formats if options.preset is conventionalcommits", () => {
    expect(
      getPresetConfig(
        {
          preset: ConventionalChangelogPreset.ConventionalCommits,
          presetConfig,
        },
        { issue, commit },
      ),
    ).toEqual({
      issueUrlFormat: `{{host}}/{{owner}}/{{repository}}/${issue}/{{id}}`,
      commitUrlFormat: `{{host}}/{{owner}}/{{repository}}/${commit}/{{hash}}`,
      ...presetConfig,
    });
  });

  it("should return origin preset config for other presets", () => {
    expect(
      getPresetConfig(
        {
          preset: ConventionalChangelogPreset.Angular,
          presetConfig,
        },
        {
          issue,
          commit,
        },
      ),
    ).toEqual(presetConfig);
  });
});
