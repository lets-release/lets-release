import { Options as WriterOptions } from "conventional-changelog-writer";
import { ParserOptions } from "conventional-commits-parser";
import { z } from "zod";

import { AnyObject, NonEmptyString } from "@lets-release/config";

import { ConventionalChangelogPreset } from "src/enums/ConventionalChangelogPreset";

export const ConventionalChangelogOptions = z.object({
  preset: z
    .enum(
      Object.values(ConventionalChangelogPreset) as [
        ConventionalChangelogPreset,
        ...ConventionalChangelogPreset[],
      ],
    )
    .optional(),
  presetConfig: AnyObject.optional(),
  config: NonEmptyString.optional(),
  parserOptions: AnyObject.optional(),
  writerOptions: AnyObject.optional(),
});

export interface ConventionalChangelogOptions {
  /**
   * [conventional-changelog][]
   * preset.
   *
   * Possible values:
   *  - [angular][]
   *  - [atom][]
   *  - [codemirror][]
   *  - [conventionalcommits][]
   *  - [ember][]
   *  - [eslint][]
   *  - [express][]
   *  - [jquery][]
   *  - [jshint][]
   *
   * Default: ConventionalChangelogPreset.ConventionalCommits if both preset and config not set
   *
   * [angular]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-angular
   * [atom]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-atom
   * [codemirror]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-codemirror
   * [conventionalcommits]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-conventionalcommits
   * [ember]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-ember
   * [eslint]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-eslint
   * [express]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-express
   * [jquery]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-jquery
   * [jshint]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-jshint
   */
  preset?: ConventionalChangelogPreset;

  /**
   * Additional configuration passed to the [conventional-changelog][] preset.
   * Used for example with [conventional-changelog-conventionalcommits][].
   *
   * [conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
   * [conventional-changelog-conventionalcommits]: https://github.com/conventional-changelog/conventional-changelog-config-spec
   */
  presetConfig?: object;

  /**
   * npm package name of a custom [conventional-changelog][] preset.
   *
   * [conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
   */
  config?: string;

  /**
   * Additional [conventional-commits-parser][] options that will extends the ones
   * loaded by preset or config. This is convenient to use a [conventional-changelog][]
   * preset with some customizations without having to create a new module.
   *
   * [conventional-commits-parser]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-commits-parser
   * [conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
   */
  parserOptions?: ParserOptions;

  /**
   * Additional [conventional-commits-writer][] options that will extends the ones loaded by
   * preset or config. This is convenient to use a [conventional-changelog][] preset with
   * some customizations without having to create a new module.
   *
   * [conventional-commits-writer]: https://github.com/conventional-changelog/conventional-changelog/tree/master/packages/conventional-changelog-writer
   * [conventional-changelog]: https://github.com/conventional-changelog/conventional-changelog
   */
  writerOptions?: WriterOptions;
}
