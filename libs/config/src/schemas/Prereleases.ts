import { isBoolean, isNil, isString, template } from "lodash-es";
import { z } from "zod";

import { isValidCalVerPrereleaseName } from "@lets-release/calver";
import {
  SemVerPrereleaseName,
  isValidSemVerPrereleaseName,
} from "@lets-release/semver";
import { VersioningScheme } from "@lets-release/versioning";

import {
  NormalizedPrereleaseOptions,
  PrereleaseOptions,
} from "src/schemas/PrereleaseOptions";

/**
 * Prerelease options record for release or maintenance branches.
 *
 * The key will be use to find the prerelease options.
 */
export const Prereleases = z
  .record(SemVerPrereleaseName, PrereleaseOptions.optional())
  .superRefine((val, ctx) => {
    const validateSemVerName = (name: string) => {
      const value = template(name)({ name: "beta" });

      if (!isValidSemVerPrereleaseName(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `SemVer Prerelease name must be be valid per the [Semantic Versioning Specification][]

[Semantic Versioning Specification]: https://semver.org/#spec-item-9`,
        });
      }
    };
    const validateCalVerName = (name: string) => {
      const value = template(name)({ name: "beta" });

      if (!isValidCalVerPrereleaseName(value)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "CalVer Prerelease name must comprise only ASCII alphanumerics hyphens, and dashes: `[0-9A-Za-z-]`",
        });
      }
    };

    for (const [key, options] of Object.entries(val).filter(
      ([_, options]) => !isNil(options),
    )) {
      if ("name" in options!) {
        if (isString(options.name)) {
          validateSemVerName(options.name);
        } else if (isBoolean(options.name)) {
          validateSemVerName(key);
        } else {
          for (const name of Object.values(options.name)) {
            validateSemVerName(isString(name) ? name : key);
          }
        }
      } else {
        for (const [scheme, value] of Object.entries(options!.names)) {
          const validator = {
            [VersioningScheme.SemVer]: validateSemVerName,
            [VersioningScheme.CalVer]: validateCalVerName,
          };

          if (isString(value)) {
            validator[scheme as VersioningScheme](value);
          } else if (isBoolean(value)) {
            validator[scheme as VersioningScheme](key);
          } else {
            for (const name of Object.values(value)) {
              validator[scheme as VersioningScheme](
                isString(name) ? name : key,
              );
            }
          }
        }
      }
    }
  });

export type Prereleases = z.input<typeof Prereleases>;

export type NormalizedPrereleases = Record<
  string,
  NormalizedPrereleaseOptions | undefined
>;
