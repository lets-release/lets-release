import { z } from "zod";

import { CalVerOptions, NormalizedCalVerOptions } from "@lets-release/calver";
import { NormalizedSemVerOptions, SemVerOptions } from "@lets-release/semver";
import { VersioningScheme } from "@lets-release/versioning";

import { Step } from "src/enums/Step";
import { GlobPattern } from "src/schemas/GlobPattern";
import { PluginSpec } from "src/schemas/PluginSpec";
import { PluginStepSpec } from "src/schemas/PluginStepSpec";
import { PartialRequired } from "src/types/PartialRequired";

export const PackageOptions = z.object({
  paths: z.array(GlobPattern).min(1),
  versioning: z.union([SemVerOptions, CalVerOptions]).default(
    SemVerOptions.parse({
      scheme: VersioningScheme.SemVer,
    }),
  ),
  plugins: z
    .array(PluginSpec)
    .default([
      "@lets-release/commit-analyzer",
      "@lets-release/release-notes-generator",
      "@lets-release/npm",
      "@lets-release/github",
    ]),
  [Step.findPackages]: z.array(PluginStepSpec).min(1).optional(),
  [Step.verifyConditions]: z.array(PluginStepSpec).min(1).optional(),
  [Step.analyzeCommits]: z.array(PluginStepSpec).min(1).optional(),
  [Step.verifyRelease]: z.array(PluginStepSpec).min(1).optional(),
  [Step.generateNotes]: z.array(PluginStepSpec).min(1).optional(),
  [Step.addChannels]: z.array(PluginStepSpec).min(1).optional(),
  [Step.prepare]: z.array(PluginStepSpec).min(1).optional(),
  [Step.publish]: z.array(PluginStepSpec).min(1).optional(),
  [Step.success]: z.array(PluginStepSpec).min(1).optional(),
  [Step.fail]: z.array(PluginStepSpec).min(1).optional(),
});

/**
 * Package options.
 */
export interface PackageOptions {
  /**
   * Paths to find packages, this option will directly be passed to
   * any findPackages plugin. Usually, a path is a glob pattern or a glob
   * string relative to the repo root.
   *
   * For example, this value will be used by [glob][] in "@lets-release/npm" plugin.
   *
   * [glob]: https://github.com/isaacs/node-glob
   */
  paths: (string | string[])[];

  /**
   * Versioning options.
   *
   * Default: { scheme: 'semver' }
   */
  versioning?: SemVerOptions | CalVerOptions;

  /**
   * Define the list of plugins to use. Plugins will run in series, in
   * the order defined, for each step if they implement it.
   *
   * Plugins configuration can be defined by wrapping the name and an
   * options object in an array.
   *
   * Default: ["@lets-release/commit-analyzer", "@lets-release/release-notes-generator"]
   */
  plugins?: PluginSpec[];

  /**
   * Spec for findPackages step.
   *
   * If set, it will override findPackages step from all plugins.
   */
  [Step.findPackages]?: PluginStepSpec<Step.findPackages>[];

  /**
   * Spec for verifyConditions step.
   *
   * If set, it will override verifyConditions step from all plugins.
   */
  [Step.verifyConditions]?: PluginStepSpec<Step.verifyConditions>[];

  /**
   * Spec for analyzeCommits step.
   *
   * If set, it will override analyzeCommits step from all plugins.
   */
  [Step.analyzeCommits]?: PluginStepSpec<Step.analyzeCommits>[];

  /**
   * Spec for verifyRelease step.
   *
   * If set, it will override verifyRelease step from all plugins.
   */
  [Step.verifyRelease]?: PluginStepSpec<Step.verifyRelease>[];

  /**
   * Spec for generateNotes step.
   *
   * If set, it will override generateNotes step from all plugins.
   */
  [Step.generateNotes]?: PluginStepSpec<Step.generateNotes>[];

  /**
   * Spec for addChannels step.
   *
   * If set, it will override addChannels step from all plugins.
   */
  [Step.addChannels]?: PluginStepSpec<Step.addChannels>[];

  /**
   * Spec for prepare step.
   *
   * If set, it will override prepare step from all plugins.
   */
  [Step.prepare]?: PluginStepSpec<Step.prepare>[];

  /**
   * Spec for publish step.
   *
   * If set, it will override publish step from all plugins.
   */
  [Step.publish]?: PluginStepSpec<Step.publish>[];

  /**
   * Spec for success step.
   *
   * If set, it will override success step from all plugins.
   */
  [Step.success]?: PluginStepSpec<Step.success>[];

  /**
   * Spec for fail step.
   *
   * If set, it will override fail step from all plugins.
   */
  [Step.fail]?: PluginStepSpec<Step.fail>[];
}

/**
 * Normalized package options.
 */
export interface NormalizedPackageOptions
  extends PartialRequired<PackageOptions, "plugins"> {
  versioning: NormalizedSemVerOptions | NormalizedCalVerOptions;
}
