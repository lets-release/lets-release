import conventionalCommits from "conventional-changelog-conventionalcommits";

import { loadModule } from "@lets-release/config";

import { ConventionalChangelogPreset } from "src/enums/ConventionalChangelogPreset";
import { ConventionalChangelogOptions } from "src/schemas/ConventionalChangelogOptions";
import { Preset } from "src/types/Preset";
import { PresetLoader } from "src/types/PresetLoader";

/**
 * Load `conventional-changelog-parser` options. Handle presets that return either a `Promise<Array>` or a `Promise<Function>`.
 */
export async function loadPreset(
  {
    preset,
    presetConfig,
    config,
    parserOptions,
    writerOptions,
  }: ConventionalChangelogOptions,
  dirs?: string[],
  cwd: string = process.cwd(),
): Promise<Preset> {
  const presetModule =
    !preset && config
      ? config
      : `conventional-changelog-${(preset ?? ConventionalChangelogPreset.ConventionalCommits).toLowerCase()}`;

  const loader = await loadModule<PresetLoader>(presetModule, dirs, cwd).catch(
    (error) => {
      if (
        preset === ConventionalChangelogPreset.ConventionalCommits ||
        (!preset && !config)
      ) {
        return conventionalCommits;
      } else {
        throw error;
      }
    },
  );

  const loadedPreset = await loader(
    !preset && config ? undefined : presetConfig,
  );

  return {
    parser: { ...loadedPreset.parser, ...parserOptions },
    writer: { ...loadedPreset.writer, ...writerOptions },
  };
}
