import { debug } from "debug";
import { isMatchWith, isString } from "lodash-es";
import micromatch from "micromatch";

import { Package, RELEASE_TYPES, ReleaseType } from "@lets-release/config";
import { ParsedCommit } from "@lets-release/conventional-changelog";

import { compareReleaseTypes } from "src/helpers/compareReleaseTypes";
import { name } from "src/plugin";
import { ReleaseRule } from "src/schemas/ReleaseRule";

/**
 * Find all the rules matching and return the highest release type of the matching rules.
 */
export function analyzeCommit(
  pkg: Package,
  commit: Omit<ParsedCommit, "rawMsg">,
  releaseRules: ReleaseRule[],
): ReleaseType | null | undefined {
  const namespace = `${name}:${pkg.name}`;
  let releaseType: ReleaseType | null | undefined;

  releaseRules
    .filter(
      ({ breaking, revert, release: _, ...rule }) =>
        // If the rule is not `breaking` or the commit doesn't have a breaking change note
        (!breaking || (commit.notes && commit.notes.length > 0)) &&
        // If the rule is not `revert` or the commit is not a revert
        (!revert || commit.revert) &&
        // Otherwise match the regular rules
        isMatchWith(commit, rule, (object, source) =>
          isString(source) && isString(object)
            ? micromatch.isMatch(object, source)
            : undefined,
        ),
    )
    .every((match) => {
      if (compareReleaseTypes(match.release, releaseType)) {
        releaseType = match.release;

        debug(namespace)(
          `The rule %o match commit with release type ${releaseType}`,
          match,
        );

        if (releaseType === RELEASE_TYPES[0]) {
          debug(namespace)(
            "Release type ${releaseType} is the highest possible. Stop analysis.",
          );

          return false;
        }
      } else {
        debug(namespace)(
          `The rule %o match commit with release type ${match.release} but the higher release type ${releaseType} has already been found for this commit`,
          match,
        );
      }

      return true;
    });

  return releaseType;
}
