import { z } from "zod";

import {
  CalVerPrereleaseNameSpec,
  NormalizedCalVerPrereleaseNameSpec,
} from "@lets-release/calver";
import {
  NormalizedSemVerPrereleaseNameSpec,
  SemVerPrereleaseNameSpec,
} from "@lets-release/semver";
import { VersioningScheme } from "@lets-release/versioning";

import { Channels, NormalizedChannels } from "src/schemas/Channels";

/**
 * Base prerelease options.
 */
export const BasePrereleaseOptions = z.object({
  /**
   * The pre-release distribution channels.
   */
  channels: Channels.optional(),
});

export type BasePrereleaseOptions = z.infer<typeof BasePrereleaseOptions>;

export interface NormalizedBasePrereleaseOptions {
  /**
   * The pre-release distribution channels.
   */
  channels: NormalizedChannels;
}

/**
 * Common prerelease options.
 */
export const CommonPrereleaseOptions = BasePrereleaseOptions.extend({
  /**
   * The pre-release name (used for both semver and calver packages).
   */
  name: SemVerPrereleaseNameSpec,
});

export type CommonPrereleaseOptions = z.infer<typeof CommonPrereleaseOptions>;

export type NormalizedCommonPrereleaseOptions =
  NormalizedBasePrereleaseOptions & {
    /**
     * The pre-release name (used for both semver and calver packages).
     */
    name: NormalizedSemVerPrereleaseNameSpec;
  };

/**
 * Classified prerelease options.
 */
export const ClassifiedPrereleaseOptions = BasePrereleaseOptions.extend({
  /**
   * The pre-release names.
   */
  names: z.object({
    [VersioningScheme.SemVer]: SemVerPrereleaseNameSpec,
    [VersioningScheme.CalVer]: CalVerPrereleaseNameSpec,
  }),
});

export type ClassifiedPrereleaseOptions = z.infer<
  typeof ClassifiedPrereleaseOptions
>;

export type NormalizedClassifiedPrereleaseOptions =
  NormalizedBasePrereleaseOptions & {
    /**
     * The pre-release names.
     */
    names: {
      [VersioningScheme.SemVer]: NormalizedSemVerPrereleaseNameSpec;
      [VersioningScheme.CalVer]: NormalizedCalVerPrereleaseNameSpec;
    };
  };

/**
 * Prerelease options.
 */
export const PrereleaseOptions = z.union([
  CommonPrereleaseOptions,
  ClassifiedPrereleaseOptions,
]);

export type PrereleaseOptions = z.infer<typeof PrereleaseOptions>;

export type NormalizedPrereleaseOptions =
  | NormalizedCommonPrereleaseOptions
  | NormalizedClassifiedPrereleaseOptions;
