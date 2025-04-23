import debug from "debug";
import { isUndefined } from "lodash-es";

import {
  RELEASE_TYPES,
  ReleaseType,
  Step,
  StepFunction,
  compareReleaseTypes,
} from "@lets-release/config";
import { loadPreset, parseCommits } from "@lets-release/conventional-changelog";

import { DEFAULT_RELEASE_RULES } from "src/constants/DEFAULT_RELEASE_RULES";
import { analyzeCommit } from "src/helpers/analyzeCommit";
import { loadReleaseRules } from "src/helpers/loadReleaseRules";
import { name } from "src/plugin";
import { CommitAnalyzerOptions } from "src/schemas/CommitAnalyzerOptions";

export const analyzeCommits: StepFunction<
  Step.analyzeCommits,
  CommitAnalyzerOptions
> = async ({ cwd, logger, repositoryRoot, commits, package: pkg }, options) => {
  const parsedOptions = await CommitAnalyzerOptions.parseAsync(options);
  const releaseRules = await loadReleaseRules(
    parsedOptions,
    [pkg.path, repositoryRoot],
    cwd,
  );
  const preset = await loadPreset(
    parsedOptions,
    [pkg.path, repositoryRoot],
    cwd,
  );
  let releaseType: ReleaseType | undefined;

  const namespace = `${name}:${pkg.uniqueName}`;
  const parsedCommits = parseCommits(pkg, commits, preset.parser);

  for (const { rawMsg, ...commit } of parsedCommits) {
    debug(namespace)(`Analyzing commit: ${rawMsg}`);

    let commitReleaseType: ReleaseType | null | undefined;

    // Determine release type based on custom releaseRules
    if (releaseRules) {
      debug(namespace)("Analyzing with custom rules");
      commitReleaseType = analyzeCommit(pkg, commit, releaseRules);
    }

    // If no custom releaseRules or none matched the commit, try with default releaseRules
    if (isUndefined(commitReleaseType)) {
      debug(namespace)("Analyzing with default rules");
      commitReleaseType = analyzeCommit(pkg, commit, DEFAULT_RELEASE_RULES);
    }

    if (commitReleaseType) {
      debug(namespace)(
        "The release type for the commit is ${commitReleaseType}",
      );
    } else {
      debug(namespace)("The commit should not trigger a release");
    }

    // Set releaseType if commit's release type is higher
    if (
      commitReleaseType &&
      compareReleaseTypes(commitReleaseType, releaseType)
    ) {
      releaseType = commitReleaseType;
    }

    // Break loop if releaseType is the highest
    if (releaseType === RELEASE_TYPES[0]) {
      break;
    }
  }

  logger.log({
    prefix: `[${pkg.uniqueName}]`,
    message: `Analysis of ${commits.length} commits complete: ${releaseType ?? "no"} release`,
  });

  return releaseType;
};
