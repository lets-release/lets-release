import { format } from "node:url";

import { Context, writeChangelogStream } from "conventional-changelog-writer";
import debug from "debug";
import getStream from "get-stream";
import intoStream from "into-stream";
import { find, merge } from "lodash-es";
import { readPackageUp } from "read-package-up";

import { Step, StepFunction, parseGitUrl } from "@lets-release/config";
import { loadPreset, parseCommits } from "@lets-release/conventional-changelog";

import { getPresetConfig } from "src/helpers/getPresetConfig";
import { name } from "src/plugin";
import { ReleaseNotesGeneratorOptions } from "src/schemas/ReleaseNotesGeneratorOptions";

const hosts = {
  github: {
    hostname: "github.com",
    issue: "issues",
    commit: "commit",
    referenceActions: [
      "close",
      "closes",
      "closed",
      "fix",
      "fixes",
      "fixed",
      "resolve",
      "resolves",
      "resolved",
    ],
    issuePrefixes: ["#", "gh-"],
  },
  bitbucket: {
    hostname: "bitbucket.org",
    issue: "issue",
    commit: "commits",
    referenceActions: [
      "close",
      "closes",
      "closed",
      "closing",
      "fix",
      "fixes",
      "fixed",
      "fixing",
      "resolve",
      "resolves",
      "resolved",
      "resolving",
    ],
    issuePrefixes: ["#"],
  },
  gitlab: {
    hostname: "gitlab.com",
    issue: "issues",
    commit: "commit",
    referenceActions: [
      "close",
      "closes",
      "closed",
      "closing",
      "fix",
      "fixes",
      "fixed",
      "fixing",
    ],
    issuePrefixes: ["#"],
  },
};
const defaultHost = {
  issue: "issues",
  commit: "commit",
  referenceActions: [
    "close",
    "closes",
    "closed",
    "closing",
    "fix",
    "fixes",
    "fixed",
    "fixing",
    "resolve",
    "resolves",
    "resolved",
    "resolving",
  ],
  issuePrefixes: ["#", "gh-"],
};

/**
 * Generate the changelog for all the commits in `options.commits`.
 */
export const generateNotes: StepFunction<
  Step.generateNotes,
  ReleaseNotesGeneratorOptions
> = async (
  {
    cwd,
    options: { repositoryUrl },
    repositoryRoot,
    package: pkg,
    commits,
    lastRelease,
    nextRelease,
  },
  options,
) => {
  const parsedOptions = await ReleaseNotesGeneratorOptions.parseAsync(options);
  const {
    hostname,
    port,
    protocol,
    owner,
    repo: repository,
  } = parseGitUrl(repositoryUrl);
  const { issue, commit, referenceActions, issuePrefixes } =
    find(hosts, (conf) => conf.hostname === hostname) ?? defaultHost;
  const presetOptions = {
    ...parsedOptions,
    presetConfig: getPresetConfig(parsedOptions, { issue, commit }),
  };
  const preset = await loadPreset(
    presetOptions,
    [pkg.path, repositoryRoot],
    cwd,
  );
  const parsedCommits = parseCommits(commits, {
    referenceActions,
    issuePrefixes,
    ...preset.parser,
  });
  const previousTag = lastRelease?.tag;
  const currentTag = nextRelease.tag;
  const {
    host: hostConfig,
    linkCompare,
    linkReferences,
    commit: commitConfig,
    issue: issueConfig,
  } = parsedOptions;
  const changelogContext = merge(
    {
      version: nextRelease.version,
      host: format({
        protocol: protocol && /http[^s]/.test(protocol) ? "http" : "https",
        hostname,
        port: protocol.includes("ssh") ? "" : port,
      }),
      owner,
      repository,
      previousTag,
      currentTag,
      linkCompare: !!currentTag && !!previousTag,
      commit,
      issue,
      packageData: ((await readPackageUp({ normalize: false, cwd })) || {})
        .packageJson,
    },
    {
      host: hostConfig,
      linkCompare,
      linkReferences,
      commit: commitConfig,
      issue: issueConfig,
    },
  ) as Context & {
    previousTag: string;
    currentTag: string;
  };

  const namespace = `${name}:${pkg.name}`;

  debug(namespace)(`version: ${changelogContext.version}`);
  debug(namespace)(`host: ${changelogContext.host}`);
  debug(namespace)(`owner: ${changelogContext.owner}`);
  debug(namespace)(`repository: ${changelogContext.repository}`);
  debug(namespace)(`previousTag: ${changelogContext.previousTag}`);
  debug(namespace)(`currentTag: ${changelogContext.currentTag}`);
  debug(namespace)(`linkReferences: ${changelogContext.linkReferences}`);
  debug(namespace)(`commit: ${changelogContext.commit}`);
  debug(namespace)(`issue: ${changelogContext.issue}`);

  return await getStream(
    intoStream
      .object(parsedCommits)
      .pipe(writeChangelogStream(changelogContext, preset.writer)),
  );
};
